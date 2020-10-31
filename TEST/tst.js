const notandor = require('./index')

function creat_success_task(seq) {
    let tmout = parseInt(Math.random()*10);
    let p = new Promise(
        (rs,rj) => {
            setTimeout(
                function() {
                    clearTimeout(tmout);
                    tmout = null;
                    rs("task: "+seq+" Success");
                },
                1000* tmout
            )
        }
    )
    return(p)
}

function creat_fail_task(seq) {
    let tmout = parseInt(Math.random()*10);
    let p = new Promise(
        (rs,rj) => {
            setTimeout(
                function() {
                    clearTimeout(tmout);
                    tmout = null;
                    rj(new Error("task: "+seq+" Fail!!!"));
                },
                1000* tmout
            )
        }
    )
    return(p)
}

function creat_random_task(seq) {
    let tmout = parseInt(Math.random()*10);
    let rand_err = parseInt(Math.random()*10);
    let p = new Promise(
        (rs,rj) => {
            setTimeout(
                function() {
                    clearTimeout(tmout);
                    tmout = null;
                    if(rand_err< 5) {
                        rj(new Error("task: "+seq+" Fail!!!"))
                    } else {
                        rs("task: "+seq+" Success")
                    }
                },
                1000* tmout
            )
        }
    )
    return(p)
}

