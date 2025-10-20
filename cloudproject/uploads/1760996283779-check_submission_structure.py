import sys
import tarfile
import re
import os

# Expected files inside the top-level folder
EXPECTED_FILES = {
    "Dockerfile",
    "app.js",
    "fly.toml",
    "package.json",
    "url.txt",
}

# Regex for Fly.io URL
URL_REGEX = re.compile(r"^https://.+\.fly\.dev$")


def check_submission(tar_path):
    issues = []
    tar_path = os.path.abspath(tar_path)

    # Basic checks
    if not os.path.exists(tar_path):
        return [f"File not found: {tar_path}"]
    if not tar_path.endswith(".tar.gz"):
        return ["File must be a .tar.gz archive."]

    try:
        with tarfile.open(tar_path, "r:gz") as tar:
            members = tar.getnames()

            # Find top-level folders
            top_level_dirs = {m.split("/")[0] for m in members if "/" in m}

            if len(top_level_dirs) != 1:
                issues.append(
                    f"Archive should contain exactly one top-level folder, found {len(top_level_dirs)}: {sorted(top_level_dirs)}"
                )
                return issues

            folder_name = list(top_level_dirs)[0]

            # Collect files directly under that folder
            assignment_files = {
                os.path.basename(m)
                for m in members
                if m.startswith(folder_name + "/") and not m.endswith("/") and m.count("/") == 1
            }

            # Check missing/extra files
            missing_files = EXPECTED_FILES - assignment_files
            extra_files = assignment_files - EXPECTED_FILES

            if missing_files:
                issues.append(f"Missing required files: {', '.join(sorted(missing_files))}")
            if extra_files:
                issues.append(f"Unexpected files found: {', '.join(sorted(extra_files))}")

            # Check url.txt content
            url_path = f"{folder_name}/url.txt"
            if url_path in members:
                f = tar.extractfile(url_path)
                if f:
                    url = f.read().decode().strip()
                    if not URL_REGEX.match(url):
                        issues.append(
                            f"Invalid URL in url.txt: '{url}'. "
                            f"It should start with 'https://' and end with '.fly.dev'."
                        )
                else:
                    issues.append("Could not read url.txt inside the archive.")
            else:
                issues.append("Missing file: url.txt")

    except tarfile.ReadError:
        return ["Error: Not a valid .tar.gz file."]
    except Exception as e:
        return [f"Unexpected error: {str(e)}"]

    return issues


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python check_submission_structure.py <path_to_submission.tar.gz>")
        sys.exit(1)

    tar_path = sys.argv[1]
    issues = check_submission(tar_path)

    if issues:
        print("Submission issues found:")
        for issue in issues:
            print(f"- {issue}")
        sys.exit(1)
    else:
        print("Submission is correct! No issues found.")
        sys.exit(0)