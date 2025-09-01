import gulp, { src } from "gulp";
import gpug from "gulp-pug"
import { deleteAsync } from "del";
import ws from "gulp-webserver";
import image from "gulp-image";
import gulpSass from "gulp-sass";
import dartSass from "sass";
import miniCSS from "gulp-csso";
import bro from "gulp-bro";
import babelify from "babelify";

const sass = gulpSass(dartSass); // <--- 이 부분이 핵심 수정입니다.

const routes = {
    pug: {
        src: "src/*.pug",
        dest: "build",
        watch: "src/**/*.pug"
    },
    img: {
        src: "src/img/**/*",
        dest: "build/img"
    },
    scss: {
        src: "src/scss/style.scss",
        dest: "build/css",
        watch: "src/scss/**/*.scss"
    },
    js: {
        src: "src/js/main.js",
        dest: "build/js",
        watch: "src/js/**/*.js"
    }
};

const pug = () =>
    gulp
        .src(routes.pug.src)
        .pipe(gpug())
        .pipe(gulp.dest(routes.pug.dest));

const clean = () => deleteAsync(["build"]);

const webserver = () => gulp.src("build").pipe(ws({
    livereload: true,
    open: true
}));

const img = () =>
    gulp
        .src(routes.img.src)
        .pipe(image())
        .pipe(gulp.dest(routes.img.dest));

const styles = () => {
    return src(routes.scss.src)
        .pipe(sass().on("error", sass.logError))
        .pipe(miniCSS())
        .pipe(gulp.dest(routes.scss.dest));
}

const js = () => {
    return src(routes.js.src)
        .pipe(
            bro({
                debug: true,
                transform: [
                    babelify.configure({ presets: ['@babel/preset-env'] }),
                    ["uglifyify", { global: true }]
                ]
            }))
        .pipe(gulp.dest(routes.js.dest));
}

const watch = () => {
    gulp.watch(routes.pug.watch, pug);
    gulp.watch(routes.img.src, pug);
    gulp.watch(routes.scss.watch, styles);
    gulp.watch(routes.js.watch, js);
}

const prepare = gulp.series([clean, img]);

const assets = gulp.series([pug, styles, js]);

const postDev = gulp.parallel([webserver, watch]);

export const dev = gulp.series([prepare, assets, postDev]);
