# 04 · Install PyArmor

> ⏱ 5 minutes · You will check the PyArmor version, read its license status, and learn which
> features the free trial includes.

## PyArmor is already installed

`uv sync` installed PyArmor from the `protect` dependency group in `pyproject.toml`:

```toml
[dependency-groups]
# The obfuscator. Needed on the build machine only, never in the runtime image.
protect = ["pyarmor==9.2.7"]
```

It is a separate group on purpose: PyArmor is a **build tool**. The machine that runs the protected
app never needs it. (PyArmor's own docs say the same: do not install it on the target device.)

Installing it on its own, anywhere else:

```bash
pip install pyarmor==9.2.7
```

## Check the version

```bash
uv run pyarmor --version
```

> **What it does:** prints the PyArmor version and the license it runs under.
> **Why:** PyArmor's command line changed a lot between major versions, so always know which one
> you have. This workshop was written and tested with **9.2.7**.
> **Expected:**
>
> ```text
> Pyarmor 9.2.7 (trial), 000000, non-profits
>
> License Type    : pyarmor-trial
> License No.     : pyarmor-vax-000000
> ...
> BCC Mode        : No
> RFT Mode        : No
> CI/CD Mode      : No
>
> Notes
> * Can't obfuscate big script and mix str
> ```

## The commands you will use

```bash
uv run pyarmor gen --help
```

> **What it does:** shows the options of `pyarmor gen`, the command that generates protected
> scripts and their runtime.
> **Why:** almost everything in this workshop is one `pyarmor gen` call with different options.
> **Expected:** a usage line starting `usage: pyarmor gen [-h] [-O PATH] ...`

| Option | Meaning | Chapter |
|---|---|---|
| `-O PATH` | output folder (default `dist/`) | 05 |
| `-r` | recurse into sub-packages | 05 |
| `--exclude PATTERN` | leave paths out | 05 |
| `-i` | put the runtime inside the package | 06 |
| `-e DATE` / `-e DAYS` | expire the build | 06 |
| `-b DEV` | bind the build to a device | 06 |
| `--pack onedir\|onefile` | bundle with PyInstaller | 08 |

## Version-sensitive commands

> [!WARNING]
> Old tutorials use commands that no longer exist. **PyArmor 9.x (and 8.x):** `pyarmor gen ...`.
> **PyArmor 7.x and older:** `pyarmor obfuscate ...`, `pyarmor pack ...`, `pyarmor licenses ...`.
> If a guide uses `obfuscate`, it was written for the old generation; PyArmor 8 and later ship the
> old CLI only as a separate legacy command, `pyarmor-7`. Use the [current
> documentation](https://pyarmor.readthedocs.io/en/latest/) as the authority.

## The trial, and licensing

The trial never expires and covers everything in this workshop. Its limits, from
[PyArmor's license page](https://pyarmor.readthedocs.io/en/latest/licenses.html) and our own tests:

| | Trial | Paid licenses |
|---|---|---|
| Obfuscate scripts and packages, runtime, expiry, device binding, PyInstaller packing | ✓ | ✓ |
| **Big scripts** (a module above a certain size) | ✗ `out of license` | Basic and above |
| `--mix-str` (protect string constants) | ✗ | Basic and above |
| BCC mode (compile functions to C), RFT mode (rename names) | ✗ | Pro, Group, CI |
| CI/CD pipelines, local Docker builds | ✓ (fewer than 100 runs a month) | depends on the plan |

> [!IMPORTANT]
> **The trial is not for commercial products that earn real money.** PyArmor's terms say the free
> version may be used for scripts that "could not make lot of money" for you, and that a product
> needs a license once its sales pass 100 times the license fee. Read the [license
> page](https://pyarmor.readthedocs.io/en/latest/licenses.html) before you ship anything.

**How big is "big"?** PyArmor does not publish the threshold. In our tests on 9.2.7, a module with
30 realistic functions passed, and one with 200 tiny functions failed. The limit depends on the
compiled code, not on the file size in bytes. That is one reason this app is split into small,
focused modules (which is good design anyway).

> [!CAUTION]
> When a module is too big, PyArmor 9.2.7 logs `ERROR out of license` but **still exits with
> status 0**. A script or CI job that only checks the exit code will treat a failed build as a good
> one. `scripts/obfuscate.py` reads the log for this reason, and `scripts/verify.py` checks the
> output.

If you have a license, register it on the build machine with `pyarmor reg <regfile>`. In CI, store
the registration file as an encrypted secret, never in the repository (chapter 12).

Next: [05 · Obfuscation](05-obfuscation.md)
