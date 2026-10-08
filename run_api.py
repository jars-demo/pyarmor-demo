"""Entry script for a single-folder PyInstaller bundle of the protected API (workshop step 08).

    pyarmor gen --pack onedir -r run_api.py app

PyInstaller needs a script to start from; `python -m app` is not one. Running this file directly
does the same as `python -m app`.
"""

from app.__main__ import main

main()
