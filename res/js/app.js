Vue.config.devtools = config.vueDevToolsEnabled;


const data = {
    menuOpen: false,
    loggedIn: true
};

const methods = {

};

const app = new Vue({
    el: '#app',
    data: data,
    methods: methods
});