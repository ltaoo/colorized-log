console.log('patchRoutes');

function foo() {
    console.primary(__func, routes);
}

foo(() => {
    console.log();
});

const obj = {
    a() {
        console.log();
    },
};
