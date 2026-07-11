#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import subprocess
import sys
import traceback
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


def run_command(
    command: str,
    cwd: Path,
) -> subprocess.CompletedProcess[str]:
    print(f"\n$ {command}\n")

    return subprocess.run(
        command,
        cwd=cwd,
        shell=True,
        text=True,
        check=False,
        timeout=900,
    )


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def parse_junit(path: Path) -> dict[str, int]:
    root = ET.parse(path).getroot()

    passed = 0
    failed = 0
    skipped = 0

    for testcase in root.iter():
        if local_name(testcase.tag) != "testcase":
            continue

        child_tags = {
            local_name(child.tag)
            for child in list(testcase)
        }

        if (
            "failure" in child_tags
            or "error" in child_tags
        ):
            failed += 1
        elif "skipped" in child_tags:
            skipped += 1
        else:
            passed += 1

    return {
        "passed": passed,
        "failed": failed,
        "skipped": skipped,
        "total": passed + failed + skipped,
    }


def parse_jest(path: Path) -> dict[str, int]:
    data = json.loads(
        path.read_text(encoding="utf-8")
    )

    return {
        "passed":
            int(data.get("numPassedTests", 0)),
        "failed":
            int(data.get("numFailedTests", 0)),
        "skipped":
            int(data.get("numPendingTests", 0)),
        "total":
            int(data.get("numTotalTests", 0)),
    }


def has_python_tests(directory: Path) -> bool:
    if (directory / "tests").is_dir():
        return True

    return (
        any(directory.rglob("test_*.py"))
        or any(directory.rglob("*_test.py"))
    )


def load_package_json(
    directory: Path,
) -> dict[str, Any] | None:
    package_path = directory / "package.json"

    if not package_path.is_file():
        return None

    try:
        return json.loads(
            package_path.read_text(
                encoding="utf-8"
            )
        )
    except json.JSONDecodeError:
        return None


def detect_configuration(
    root: Path,
) -> dict[str, str] | None:
    # Optional override for non-standard repositories.
    explicit_config = root / ".portfolio-ci.json"

    if explicit_config.is_file():
        config = json.loads(
            explicit_config.read_text(
                encoding="utf-8"
            )
        )

        required = {
            "runtime",
            "workingDirectory",
            "installCommand",
            "testCommand",
            "resultType",
            "resultPath",
        }

        missing = required - set(config)

        if missing:
            raise ValueError(
                "Missing .portfolio-ci.json fields: "
                + ", ".join(sorted(missing))
            )

        return {
            key: str(config[key])
            for key in required
        }

    # Python / pytest detection.
    for relative_directory in ("backend", "."):
        directory = (
            root
            if relative_directory == "."
            else root / relative_directory
        )

        if not directory.is_dir():
            continue

        requirements = (
            directory / "requirements.txt"
        )
        pyproject = (
            directory / "pyproject.toml"
        )

        if not (
            requirements.is_file()
            or pyproject.is_file()
        ):
            continue

        if not has_python_tests(directory):
            continue

        if requirements.is_file():
            install_command = (
                "python -m pip install --upgrade pip "
                "&& python -m pip install "
                "-r requirements.txt pytest"
            )
        else:
            install_command = (
                "python -m pip install --upgrade pip "
                "&& python -m pip install -e . pytest"
            )

        return {
            "runtime": "python",
            "workingDirectory":
                relative_directory,
            "installCommand":
                install_command,
            "testCommand": (
                "python -m pytest -q "
                "--junitxml=portfolio-junit.xml"
            ),
            "resultType": "junit",
            "resultPath":
                "portfolio-junit.xml",
        }

    # Node.js detection.
    for relative_directory in ("backend", "."):
        directory = (
            root
            if relative_directory == "."
            else root / relative_directory
        )

        if not directory.is_dir():
            continue

        package = load_package_json(directory)

        if package is None:
            continue

        scripts = package.get("scripts") or {}
        test_script = str(
            scripts.get("test", "")
        ).strip()

        if (
            not test_script
            or "no test specified"
                in test_script.lower()
        ):
            continue

        dependencies = {
            **(package.get("dependencies") or {}),
            **(
                package.get("devDependencies")
                or {}
            ),
        }

        install_command = (
            "npm ci"
            if (
                directory / "package-lock.json"
            ).is_file()
            else "npm install"
        )

        if (
            "vitest" in dependencies
            or "vitest"
                in test_script.lower()
        ):
            return {
                "runtime": "node-vitest",
                "workingDirectory":
                    relative_directory,
                "installCommand":
                    install_command,
                "testCommand": (
                    "npx vitest run "
                    "--reporter=junit "
                    "--outputFile="
                    "portfolio-junit.xml"
                ),
                "resultType": "junit",
                "resultPath":
                    "portfolio-junit.xml",
            }

        if (
            "jest" in dependencies
            or "jest" in test_script.lower()
        ):
            return {
                "runtime": "node-jest",
                "workingDirectory":
                    relative_directory,
                "installCommand":
                    install_command,
                "testCommand": (
                    "npx jest --ci --json "
                    "--outputFile="
                    "portfolio-jest.json"
                ),
                "resultType": "jest-json",
                "resultPath":
                    "portfolio-jest.json",
            }

        if "node --test" in test_script.lower():
            return {
                "runtime": "node-test",
                "workingDirectory":
                    relative_directory,
                "installCommand":
                    install_command,
                "testCommand": (
                    "npm test -- "
                    "--test-reporter=junit "
                    "--test-reporter-destination="
                    "portfolio-junit.xml"
                ),
                "resultType": "junit",
                "resultPath":
                    "portfolio-junit.xml",
            }

    return None


def write_result(
    output_path: Path,
    result: dict[str, Any],
) -> None:
    output_path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    output_path.write_text(
        json.dumps(result, indent=2),
        encoding="utf-8",
    )

    print("\nResult:\n")
    print(json.dumps(result, indent=2))


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit(
            "Usage: run-backend-tests.py "
            "<repository-root> "
            "<result-json-path>"
        )

    root = Path(sys.argv[1]).resolve()
    output_path = Path(sys.argv[2]).resolve()

    repository = os.environ[
        "REPOSITORY_FULL_NAME"
    ]

    result: dict[str, Any] = {
        "repository": repository,
        "defaultBranch": os.environ.get(
            "REPOSITORY_DEFAULT_BRANCH",
            "main",
        ),
        "status": "not-configured",
        "runtime": None,
        "workingDirectory": None,
        "passed": 0,
        "failed": 0,
        "skipped": 0,
        "total": 0,
        "updatedAt": datetime.now(
            timezone.utc
        ).isoformat(),
        "message": (
            "No supported automated test "
            "setup was detected."
        ),
    }

    try:
        configuration = detect_configuration(
            root
        )

        if configuration is None:
            write_result(
                output_path,
                result,
            )
            return

        working_directory = (
            root
            if (
                configuration[
                    "workingDirectory"
                ] == "."
            )
            else (
                root
                / configuration[
                    "workingDirectory"
                ]
            )
        )

        result["runtime"] = (
            configuration["runtime"]
        )
        result["workingDirectory"] = (
            configuration[
                "workingDirectory"
            ]
        )

        install = run_command(
            configuration["installCommand"],
            working_directory,
        )

        if install.returncode != 0:
            result["status"] = "error"
            result["message"] = (
                "Dependency installation failed "
                f"with exit code "
                f"{install.returncode}."
            )

            write_result(
                output_path,
                result,
            )
            return

        test = run_command(
            configuration["testCommand"],
            working_directory,
        )

        result_path = (
            working_directory
            / configuration["resultPath"]
        )

        if not result_path.is_file():
            result["status"] = "error"
            result["message"] = (
                "The test command did not "
                "produce the configured "
                "result file."
            )

            write_result(
                output_path,
                result,
            )
            return

        if (
            configuration["resultType"]
            == "junit"
        ):
            counts = parse_junit(result_path)
        elif (
            configuration["resultType"]
            == "jest-json"
        ):
            counts = parse_jest(result_path)
        else:
            raise ValueError(
                "Unsupported resultType: "
                + configuration["resultType"]
            )

        result.update(counts)

        result["status"] = (
            "passing"
            if (
                test.returncode == 0
                and counts["failed"] == 0
            )
            else "failing"
        )

        result["message"] = (
            "Automated tests completed."
        )

        write_result(
            output_path,
            result,
        )

    except Exception as error:
        result["status"] = "error"
        result["message"] = str(error)
        result["traceback"] = (
            traceback.format_exc()
        )

        write_result(
            output_path,
            result,
        )


if __name__ == "__main__":
    main()
