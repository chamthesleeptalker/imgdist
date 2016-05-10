# Diwata Image Gallery

## Overview
A diwata image gallery app which contains the images taken by diwata-1.

## Dependencies
To set up the development environment of the app, install the following on your system.
- npm
- Bower ($ npm install -g bower)
- Grunt ($ npm install -g grunt) *if asked for a local instance of grunt in the project folder*
- Grunt-cli ($ npm install -g grunt-cli)

## Installation
```
npm install
bower install
```

### Proxy Environment
You can configure the proxy server for the bower dependencies by editing the *.bowerrc* file. Edit the *proxy* and the *https-proxy* parameters. If you are not running in any environment remove the *proxy* and *https-proxy* in the *.bowerrc* file.
 
## Running the app
```
grunt serve
```
*Access the site via: http://localhost:3000*

## Other Options

- Manually rebuild assets (css and minified js)
```
grunt rebuild
```