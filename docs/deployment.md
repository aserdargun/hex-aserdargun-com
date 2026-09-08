# Standalone publication

- Public source: https://github.com/aserdargun/hex-aserdargun-com
- Custom domain: https://hex.aserdargun.com/
- Azure-generated URL: https://gray-moss-05c84cb03.6.azurestaticapps.net/
- Subscription: `aserdargun subscription 3`
- Resource group: `rg-hex-aserdargun-com`
- Static Web App: `swa-hex-aserdargun-com`
- Region: West Europe
- Plan: Free
- Branch: `main`; artifact: `dist/`

GitHub was published first. During Azure provisioning on 8 September 2026, subscription 2 rejected the Free site because its Free static-site quota was full. The standalone site was therefore created in subscription 3. The attempted provisioning left an empty `rg-hex-aserdargun-com` resource group in subscription 2; it contains no deployed resource.

`.github/workflows/deploy-swa-hex-aserdargun-com.yml` is the only production workflow. Official actions are pinned to immutable commits. It installs the lockfile, runs model/kinematics tests, validates both GLBs, checks TypeScript, builds the static site and checks artifact contents and MIME mappings. Azure receives this prebuilt artifact. Production deployments serialize without cancelling an upload.

The deployment credential is stored only in the repository secret `AZURE_STATIC_WEB_APPS_API_TOKEN_SWA_HEX_ASERDARGUN_COM`. Azure was created without source integration or an Azure-generated workflow. After the first successful upload, the deployment action automatically recorded the GitHub repository and `main` branch in Azure's metadata; the repository-owned workflow above remains the only deployment workflow. There is no API or paid plan.

## IHS custom domain

`hex.aserdargun.com` uses IHS DNS and the existing Azure Free application. IHS stores the zone-relative `hex` CNAME pointing to `gray-moss-05c84cb03.6.azurestaticapps.net` and `_dnsauth.hex` TXT for Azure ownership validation. The generated validation value is not kept in the repository. Other DNS records are outside this change.

Azure manages HTTPS for the custom hostname. Domain verification includes both IHS authoritative nameservers (`knuth.ihsdns.com` and `dijkstra.ihsdns.com`), public DNS, Azure custom-domain status, certificate SAN, HTTPS content and live browser interactions. DNS submission alone does not establish a completed domain release.

`/release.json` identifies the deployed Git commit, build time and GitHub Actions run. Verify that its `releaseSha` equals the successful production run's `headSha`, then check the Azure production environment is `Ready`, representative HTTP assets have their expected MIME types, and the desktop/mobile explorer loads and responds. Historical local visual checks are in [verification.md](verification.md).
