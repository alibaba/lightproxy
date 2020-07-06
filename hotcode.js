const {
    CoreAPI,
    version,
} = window.__LIGHTPROXY__;

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}

if (!window.__HOTCODE_INITED__) {
    console.log('init hotcode');
    // first inited
    window.__HOTCODE_INITED__ = true;

    if (!CoreAPI.store.get('userid')) {
        CoreAPI.store.set('userid', uuidv4());
    }
    const userid = CoreAPI.store.get('userid');

    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
        
    ga('create', 'UA-154996514-1', {
        'storage': 'none',
        'clientId': userid,
    });
    
    ga('set', 'checkProtocolTask', null);
    
    ga('set', 'page', '/');
    ga('send', 'pageview');

    setInterval(() => {
        ga('send', 'pageview');
        // 2 hour
    }, 1000 * 60 * 60 * 2);
}

