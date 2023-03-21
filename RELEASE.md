
Instructions for the Maintainer

**********************
 PREPARING A RELEASE - first steps, command line
**********************

- Create a dedicated branch for the release;

  git checkout master
  git checkout -b release_4.X.X

- Run basic npm security checks;

  npm audit fix

- update version

  package-lock.json: "version": "2.5.x",
  package.json: "version": "2.5.x",

- check with shell command;

  head -4 package*.json | grep version


- Update changelog.md

- Build release;

  grunt

- add/commit/push all including build/

  git add --all
  git commit -am "release 4.X.X"
  git push


**********************
 PREPARING A RELEASE - second step on github.com
**********************

- prepare a new release using changelog.md

**********************
 PREPARING A RELEASE - third step on npmjs.com
**********************
