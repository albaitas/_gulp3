var gulp        = require('gulp'),
    browserSync = require('browser-sync'),
    concat      = require('gulp-concat'),       // failu konkatinacijai
    uglify      = require('gulp-uglifyjs'),     // failu suspaudimui
    cssnano     = require('gulp-cssnano'),      // CSS minifikavimui
    rename      = require('gulp-rename'),       // biblioteku pervadinimui
    del         = require('del'),               // failu ir aplankalu isvalymas
    imagemin    = require('gulp-imagemin'),     // darbui su images
    pngquant    = require('imagemin-pngquant'), // darbui su png
    cache       = require('gulp-cache'),        // kesavimui
    autoprefixer = require('gulp-autoprefixer'), //prefiksai ivairiems brauzeriams
    sass        = require('gulp-sass');

    gulp.task('sass', function() {           // sukuriame sass taska
     return gulp.src('app/sass/**/*.sass')   // pradinis failas
        .pipe(sass())                        // Sass paverciame i CSS su gulp-sass
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // prefiksai
        .pipe(gulp.dest('app/css'))          // patalpiname rezultata i app/css
        .pipe(browserSync.reload({stream: true})); // atnaujiname jeigu pasikeite CSS puslapyje
    });

    gulp.task('scripts', function() {
        return gulp.src([                                               // paimame reikalingas bibliotekas
            'app/libs/jquery/dist/jquery.min.js',                       // paimame jQuery
            'app/libs/magnific-popup/dist/jquery.magnific-popup.min.js' // paimame Magnific Popup
            ])
            .pipe(concat('libs.min.js'))                                // sujungiame visus i viena faile libs.min.js
            .pipe(uglify())                                             // suspaudziame JS failus
            .pipe(gulp.dest('app/js'));                                // patalpiname viska i aplankala app/js
    });

    gulp.task('browser-sync', function() {    // sukuriame serverio taska
        browserSync({
            server: {                         // nustatome serverio parametrus
                baseDir: 'app'                // serverio direktorija - app
            },
            notify: false                    // atsaukiame informacijos rodyma
        });
    });

    gulp.task('css-libs', ['sass'], function() {
      return gulp.src('app/css/libs.css')     // pasirenkame faila minimizavimui
        .pipe(cssnano())                      // suspaudziame
        .pipe(rename({suffix: '.min'}))       // pridedame .min
        .pipe(gulp.dest('app/css'));          // patalpiname i app/css
    });

    gulp.task('clean', function() {
     return del.sync('dist');              // isvalome aplankala dist pries surinkima
    });

    gulp.task('clear', function() {
     return cache.clearAll();              // isvalome kesa
    });

    gulp.task('img', function() {
     return gulp.src('app/img/**/*')      // paimame visas nuotraukas is app
       .pipe(cache(imagemin({            // suspaudziame su pasirinktais nustatymais pridedame kesa
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('dist/img'));      // patalpiname i produkcija
    });

    gulp.task('watch', ['browser-sync', 'css-libs', 'scripts'], function() { // nustatome tasku eile pries watch
    gulp.watch('app/sass/**/*.sass', ['sass']);       // stebime sass failus
    gulp.watch('app/*.html', browserSync.reload);     // stebime HTML failus
    gulp.watch('app/js/**/*.js', browserSync.reload); // stebime JS failus
    });


    gulp.task('build', ['clean', 'img', 'sass', 'scripts'], function() {

        var buildCss = gulp.src([                   // perkeliame CSS stilius i produkcija
            'app/css/main.css',
            'app/css/libs.min.css'
            ])
        .pipe(gulp.dest('dist/css'));

        var buildFonts = gulp.src('app/fonts/**/*')  // perkeliame sriftus i produkcija
        .pipe(gulp.dest('dist/fonts'));

        var buildJs = gulp.src('app/js/**/*')        // perkeliame js skriptus i produkcija
        .pipe(gulp.dest('dist/js'));

        var buildHtml = gulp.src('app/*.html')       // perkeliame HTML i produkcija
        .pipe(gulp.dest('dist'));
    });


