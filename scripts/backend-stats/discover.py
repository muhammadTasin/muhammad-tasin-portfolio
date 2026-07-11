#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import re
import urllib.request


API_URL = (
    "https://api.github.com/user/repos"
    "?visibility=all&affiliation=owner&sort=pushed"
    "&direction=desc&per_page=100"
)


def github_get(url: str) -> list[dict]:
    request = urllib.request.Request(
        url,
        headers={
            "Accept": "application/vnd.github+json",
            "Authorization":
                f"Bearer {os.environ['BACKEND_REPOS_TOKEN']}",
            "User-Agent": "muhammad-tasin-portfolio",
            "X-GitHub-Api-Version": "2022-11-28",
        },
    )

    with urllib.request.urlopen(
        request,
        timeout=30,
    ) as response:
        return json.load(response)


def artifact_key(repository_name: str) -> str:
    return re.sub(
        r"[^A-Za-z0-9._-]+",
        "-",
        repository_name,
    ).strip("-")


def main() -> None:
    owner = os.environ.get(
        "GITHUB_OWNER",
        "muhammadTasin",
    )

    repositories: list[dict] = []
    page = 1

    while True:
        page_items = github_get(
            f"{API_URL}&page={page}"
        )

        if not page_items:
            break

        repositories.extend(page_items)

        if len(page_items) < 100:
            break

        page += 1

    selected = []

    for repository in repositories:
        topics = {
            str(topic).lower()
            for topic in repository.get("topics", [])
        }

        if (
            repository.get("owner", {}).get("login")
                != owner
            or repository.get("fork")
            or repository.get("archived")
            or "backend" not in topics
        ):
            continue

        selected.append(
            {
                "full_name":
                    repository["full_name"],
                "name":
                    repository["name"],
                "default_branch":
                    repository["default_branch"],
                "artifact_key":
                    artifact_key(repository["name"]),
            }
        )

    matrix = {"include": selected}

    with open(
        os.environ["GITHUB_OUTPUT"],
        "a",
        encoding="utf-8",
    ) as output:
        output.write(
            "matrix="
            + json.dumps(
                matrix,
                separators=(",", ":"),
            )
            + "\n"
        )
        output.write(
            f"count={len(selected)}\n"
        )

    print(
        json.dumps(
            {
                "backendRepositoryCount":
                    len(selected),
                "repositories": [
                    item["full_name"]
                    for item in selected
                ],
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
