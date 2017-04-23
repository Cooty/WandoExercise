# Demo app for Wando

Demo product search made for Wando

Link for the working app: http://beardesign.hu/demos/wando/

You can also clone this repo and run the app locally

## Instructions for local setup

1) Clone this repo
2) Check if you have [Node.js](http://nodejs.org), [npm](https://www.npmjs.com/) and [Grunt](https://gruntjs.com/) installed on your machine
3) If every dependency is installed than, run `npm install` in the root of the project folder
4) Run `grunt start` from terminal
5) You should bw able to access the app http://localhost:3000
 
# Technology used

- [Knockout.js](http://knockoutjs.com/) as JS framework for connecting data to the UI. I choose KO because it is ideal for connecting data driven interfaces with the underlying data-model, also has built in templating system, so I didn't need any other libs for that, also it's very lightweight and flexible, so it plays well with any other JS library and does't force you to a particular design-pattern.
- [Bootstrap 4](https://v4-alpha.getbootstrap.com/), as UI framework
- [HTML5](https://html5boilerplate.com/) Boilerplate for getting started

## Suggestions for *Bonus 1*

My first idea was to cache the result sets fora particular keyword in Session Storage, so when a user types the
same query more than one time within a session, it does't need to be fetched from the server, but it would be there instantly.
Later I've found this to be a bad idea, since it might be necessary to always get the latest data, and there might be a risk that SessionStorage gets stuck, if the user sets "Start where I left off" mode in their browser
 
The only solution I could figure out was to add a loading state to the application.
As I was not aiming to recreate the exact UI of Wando's sites (was not in the task to do so), it's more visual, has no text, but maybe adding a progressbar that shows the state of the request would be a good idea.

Also maybe adding 'skeleton content' to the list might be a good idea, I'm thinking of empty product boxes, similar to the
hte new design on LinkedIn.com or Pinterest, this way the user could anticipate for what will be shown, also this
could minimize reflows and repaints, be the browser.     