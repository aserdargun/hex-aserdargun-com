# Standalone publication

- Public source: https://github.com/aserdargun/hex-aserdargun-com
- Azure-generated URL: https://gray-moss-05c84cb03.6.azurestaticapps.net/
- Subscription: `aserdargun subscription 3`
- Resource group: `rg-hex-aserdargun-com`
- Static Web App: `swa-hex-aserdargun-com`
- Region: West Europe
- Plan: Free
- Branch: `main`; artifact: `dist/`

GitHub was published first. During Azure provisioning on 8 September 2026, subscription 2 rejected the Free site because its Free static-site quota was full. The standalone site was therefore created in subscription 3. The attempted provisioning left an empty `rg-hex-aserdargun-com` resource group in subscription 2; it contains no deployed resource.

`.github/workflows/deploy-swa-hex-aserdargun-com.yml` is the only production workflow. Official actions are pinned to immutable commits. It installs the lockfile, runs model/kinematics tests, validates both GLBs, checks TypeScript, builds the static site and checks artifact contents and MIME mappings. Azure receives this prebuilt artifact. Production deployments serialize without cancelling an upload.

The deployment credential is stored only in the repository secret `AZURE_STATIC_WEB_APPS_API_TOKEN_SWA_HEX_ASERDARGUN_COM`. Azure was created without source integration or an Azure-generated workflow. After the first successful upload, the deployment action automatically recorded the GitHub repository and `main` branch in Azure's metadata; the repository-owned workflow above remains the only deployment workflow. There is no API, paid plan or custom-domain configuration.

`/release.json` identifies the deployed Git commit, build time and GitHub Actions run. Verify that its `releaseSha` equals the successful production run's `headSha`, then check the Azure production environment is `Ready`, representative HTTP assets have their expected MIME types, and the desktop/mobile explorer loads and responds. Historical local visual checks are in [verification.md](verification.md).
