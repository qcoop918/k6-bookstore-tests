Make sure to install k6!

I have a python script to generate extended config files in order to match our datasets.

The following command runs a script with a config file called hourtest and generates a csv called testresults.


k6 --config hourtest.json run --out csv=testresults.csv sscript.js

The target url and all "load-test methods" are located in the javascript file.

The json is additional options that can be passed to configure how the loadtest is run: amount of virtual users, iterations, etc.

The json can optionally be included within the javascript file itself.