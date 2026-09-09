# Han Pok Man — Personal Website

A monochrome personal portfolio with scroll-driven 3D motion. It uses ordinary HTML, CSS, and JavaScript, with Three.js included locally. There is no build step, package installation, API key, or paid hosting requirement.

The files are ready to publish; this package has not been deployed to your GitHub account.

The 3D scenes are conceptual illustrations of your interests and work, not photographs or exact reconstructions of your hardware. The footer’s **Motion** button turns animation on or off and remembers your choice in that browser. The site also responds to your operating system’s reduced-motion setting.

## 1. Preview on your computer

1. Unzip the website package and open the `personal-website` folder.
2. Open Terminal. Type `cd ` (with a space), drag that folder into the Terminal window, then press Return.
3. Run:

   ```sh
   python3 -m http.server 8000 --bind 127.0.0.1
   ```

4. Open [the local preview](http://localhost:8000) in your browser. Scroll through the page to see the models turn.
5. Keep Terminal open while previewing. Press **Control + C** to stop the server.

Python 3 must be installed for this preview command. If you use Visual Studio Code, its Live Server extension is another way to preview the folder. Use a local web server rather than double-clicking `index.html`, because browsers restrict JavaScript modules opened directly from disk.

## 2. Put it on GitHub — browser-only method

### Create your repository

1. Sign in to [GitHub](https://github.com), then open [Create a new repository](https://github.com/new).
2. Your CV lists the GitHub username `hanpokman`. If this is still your username, name the repository **`hanpokman.github.io`**. Your website address will be `https://hanpokman.github.io/`. Otherwise, use your current username in both places.
3. Choose **Public**, enable **Add README**, and create the repository. Public repositories support Pages on GitHub Free. [GitHub’s quickstart](https://docs.github.com/en/pages/quickstart)

If you already use that repository for another site, create one named `portfolio` instead. With the username above, its address will be `https://hanpokman.github.io/portfolio/`. This website uses relative file paths, so either address works. [GitHub’s project-site guide](https://docs.github.com/en/get-started/start-your-journey/deploying-your-website-automatically)

### Upload the website files

1. In your repository, choose **Add file → Upload files**.
2. Open the extracted `personal-website` folder on your computer. Drag its **contents** into GitHub: `index.html`, `styles.css`, `app.js`, `scenes.js`, `assets`, and the other included files. Keep the contents of `assets` inside that folder.
3. Enter a message such as `Add personal website`, select the option to commit directly to **main**, and confirm the upload.
4. Check that `index.html` is visible immediately on your repository’s main file list. It must not be nested inside an extra `personal-website` folder. Do not upload the ZIP itself.

GitHub accepts folders through drag and drop. Its browser uploader allows up to 100 files at once and 25 MiB per file. [GitHub’s upload instructions](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)

The package includes `.nojekyll`, which tells GitHub to publish these static files directly. On a Mac, **Command + Shift + .** shows hidden files in Finder. If `.nojekyll` did not upload, choose **Add file → Create new file**, name it `.nojekyll`, leave it empty, and commit it to main. [GitHub’s static-site instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)

### Turn on GitHub Pages

1. Open the repository’s **Settings** tab.
2. Select **Pages** in the sidebar.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Set the branch to **main** and the folder to **/(root)**, then click **Save**.
5. After deployment finishes, return to **Settings → Pages** and choose **Visit site**. GitHub says publishing can take up to 10 minutes. [Publishing settings](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), [publishing time](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)

You do not need to select a theme or configure a build command.

## 3. Make it yours

- **Text and links:** edit `index.html`, including your introduction, experience, education, and contact details. Update the page title and description near the top too.
- **Appearance:** edit `styles.css` to adjust typography, spacing, and the black-and-white palette.
- **Project details and controls:** edit `app.js` for the project-dialog text and Motion toggle.
- **3D models and rotation:** edit `scenes.js`.
- **Files:** keep assets in `assets/`. Use paths such as `./assets/example.pdf`; a leading slash would point outside a project site’s folder.

The downloadable `assets/Han_Pok_Man_CV.pdf` contains the original CV’s contact details. Review those details before uploading: everything published through GitHub Pages is accessible on the internet. [GitHub Pages visibility](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

To update the live site, upload the changed files to the same paths and commit them to **main**. GitHub Pages publishes updates from the selected branch automatically.

## If something looks wrong

- **404 page:** confirm `index.html` is at the repository root and Pages uses **main / (root)**. Allow the first deployment to finish.
- **Styles or models are missing:** confirm you uploaded `styles.css`, `app.js`, `scenes.js`, and the entire `assets` folder, including `assets/vendor`. File names and capitalization must match their links.
- **Models stay still:** check the footer’s Motion setting and your operating system’s reduced-motion preference.
- **An old version appears:** reload with **Command + Shift + R** on Mac or **Control + Shift + R** on Windows.
- **Deployment failed:** open the repository’s **Actions** tab and inspect the latest Pages deployment for its error message. [GitHub’s publishing troubleshooting](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## Included library

Three.js **v0.180.0** is bundled in `assets/vendor/` under the MIT License. Keep the included `assets/vendor/THREE-LICENSE.txt` with the library when sharing or publishing the website.

Guide checked against official GitHub documentation on September 9, 2026.
