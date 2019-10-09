
//const CACHE_NAME = 'cache-1';

const CACHE_STATIC_NAME = 'static-v2';
const CACHE_DYNAMIC_NAME = 'dynamic-v1';

const CACHE_INMUTABLE_NAME = 'inmutable-v1';
const CACHE_DYNAMIC_LIMIT = 50;


function limpiarCache( cacheName, numeroItems ){

    caches.open( cacheName )
        .then( cache => {
            return cache.keys()
                .then( keys => {
                    
                    if( keys.length > numeroItems ) {
                        cache.delete( keys[0] )
                            .then( limpiarCache(cacheName, numeroItems) );
                    }

            });
        });

}


self.addEventListener('install', e => {

    const cacheProm = caches.open(CACHE_STATIC_NAME)
        .then( cache => {

            return cache.addAll([
                '/',
                '/index.html',
                '/css/style.css',
                '/img/main.jpg',
                '/js/app.js',
                '/img/no-img.jpg',
            ]);

        });

    const cacheInmutable = caches.open(CACHE_INMUTABLE_NAME)
        .then(cache => cache.add('https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css'));

    e.waitUntil( Promise.all([cacheProm, cacheInmutable]));
});




/*self.addEventListener('fetch', event => {

    const offlineResp = new Response(`
    
        Bienvenido a mi Página Web

        Disculpa, pero para usarla, necesitas internet

    `);

    const offlineResp = new Response(`
    <!DOCTYPE html>
      <html lang = "en">
        <head>
        <meta charset = "UTF-8">
        <meta name = "viewport" content = "width=device-width, initial-scale=1.0">
        <meta http - equiv = "X-UA-Compatible" content = "ie=edge">
        <title> Mi PWA </title>
        </head>
        <body class = "container p-3">
            <h1>Offline Mode</h1>
        </body>
      </html>
    `, {
        headers: {
            'Content-Type':'text/html'
        }
    });

    const offlineResp = fetch('pages/offline.html');

    const resp = fetch(event.request)
                    .catch( () => offlineResp );

    event.respondWith( resp );
});*/


self.addEventListener('fetch', e => {

    /** ESTRATEGIAS DEL CACHE **/

    // 5- Cache and Network Race

    const respuesta = new Promise( (resolve, reject) => {

        let rechazada = false;

        const falloUnaVez = () => {
            if ( rechazada ) {
                if( /\.(png|jpg)$/i.test( e.request.url ) ) {
                    resolve( caches.match('/img/no-img.jpg') );
                } else {
                    reject('No se encontró respuesta');
                }
            } else {
                rechazada = true;
            }
        };


        fetch( e.request ).then( res => {
            res.ok ? resolve(res) : falloUnaVez();            
        }).catch(falloUnaVez);

        caches.match( e.request ).then( res => {
            res ? resolve(res) : falloUnaVez();
        }).catch(falloUnaVez);


    }).catch(error => {
        console.log("ERROR PROMESA:",error);
    });

    e.respondWith( respuesta );


//----------------------------------------------------------------------------------------
    // 4- Cache with network update 
    //     · Ideal si el rendimiento es lo más importante (comporta como nativa)
    //     · Actualizaciones siempre estarán un paso atrás
    /*
    if ( e.request.url.includes('bootstrap') ) {
        return e.respondWith( caches.match( e.request) );
    }

    const respuesta = caches.open( CACHE_STATIC_NAME ).then( cache => {

        fetch( e.request ).then( newRes => cache.put( e.request, newRes) );

        return cache.match( e.request );
    });

    e.respondWith( respuesta );
    */
//----------------------------------------------------------------------------------------
    // 3-  Network with Cache Fallback (tira de internet, y si no puede tira de caché)
    /* 
    const respuesta = fetch( e.request ).then( res => {

        if( !res ) return caches.match( e.request );

        caches.open( CACHE_DYNAMIC_NAME )
            .then( cache => {
                cache.put( e.request, res );
                limpiarCache(CACHE_DYNAMIC_NAME, CACHE_DYNAMIC_LIMIT );
            });

        return res.clone();

    }).catch( err => {
        return caches.match( e.request );
    });

    e.respondWith( respuesta );
    */
//----------------------------------------------------------------------------------------
    // 2- Cache with Network Fallback (tira de caché, y si no puede tira de internet)
    /*
    const respuesta = caches.match( e.request )
        .then( res => {

            if( res ) return res;

            // No existe el archivo solicitado
            // tengo que ir a la web
            console.log('No existe', e.request.url);

            return fetch( e.request )
                    .then( newResp => {
                        caches.open( CACHE_DYNAMIC_NAME )
                            .then( cache => {
                                cache.put( e.request, newResp );
                                limpiarCache( CACHE_DYNAMIC_NAME, CACHE_DYNAMIC_LIMIT );
                            });
                        return newResp.clone();
                    });

        });
    e.respondWith( respuesta );
    */
//----------------------------------------------------------------------------------------
    //// 1- Cache Only (tira sólo del caché)
    /*
        e.respondWith( caches.match( e.request ) );
    */

});