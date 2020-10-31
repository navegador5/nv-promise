notandor-promise
================

- notandor-promise is a simple tool for many promises,support more condition and self-defined condition
- support the below methods
- all-------------------------------similiar to Promise.all
- all\_not--------------------------similiar to Promise.all, but treated rejected as success
- any-------------------------------similiar to Promise.race
- any\_not--------------------------similiar to Promise.race,but treated rejected as success
- at\_least\_some-------------------at least \<n\> resolved
- at\_least\_some\_not--------------at least \<n\> rejected,treated rejected as success
- must\_some------------------------must \<n\> resolved
- must\_some\_not-------------------must \<n\> rejected,treated rejected as success
- one-------------------------------only one resolved
- one\_not--------------------------only one rejected,treated rejected as success
- at\_least\_certain----------------at least [index,index,index...]  resolved
- at\_least\_certain\_not-----------at least [index,index,index...]  rejected, treated rejected as success
- must\_certain---------------------must [index,index,index...] resolved
- must\_certain\_not----------------must [index,index,index...] rejected,    treated rejected as success
- all\_settled ---------------------similiar to Promise.allSettled
- any\_settled ---------------------any one settled
- at\_least\_some\_settled----------at least \<n\> settled
- at\_least\_certain\_settled-------at least [index,index,index...]  settled
- wrap------------------------------self-defined condition



install
=======
- npm install notandor-promise

usage
=====

READY
-----

    const notandor = require('notandor-promise')

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



all
---

    var funcs = Array.from({length:10}).map(r=>creat_success_task)
    var params = Array.from({length:10}).map((r,i)=>[i])
    var f = notandor.all(funcs,params)
    var p = f()

    /*
    > p
    Promise {
      [
        'task: 0 Success',
        'task: 1 Success',
        'task: 2 Success',
        'task: 3 Success',
        'task: 4 Success',
        'task: 5 Success',
        'task: 6 Success',
        'task: 7 Success',
        'task: 8 Success',
        'task: 9 Success'
      ],
      condition: 'all',
      extra_err_msg: undefined
    }
    >
    */

    var funcs = Array.from({length:10}).map(r=>creat_random_task)
    var params = Array.from({length:10}).map((r,i)=>[i])
    var f = notandor.all(funcs,params)
    var p = f()

    /*
    > p
    Promise {
      <rejected> Error: task: 7 Fail!!!
          at Timeout._onTimeout (repl:11:28)
          at listOnTimeout (internal/timers.js:549:17)
          at processTimers (internal/timers.js:492:7),
      condition: 'all',
      extra_err_msg: undefined
    }
    >

    */


all\_not
--------

    var funcs = Array.from({length:5}).map(r=>creat_fail_task)
    var params = Array.from({length:5}).map((r,i)=>[i])
    var f = notandor.all_not(funcs,params)
    var p = f()

    /*
    > p
    Promise {
      [
        Error: task: 0 Fail!!!
            at Timeout._onTimeout (repl:9:24)
            at listOnTimeout (internal/timers.js:549:17)
            at processTimers (internal/timers.js:492:7),
        Error: task: 1 Fail!!!
            at Timeout._onTimeout (repl:9:24)
            at listOnTimeout (internal/timers.js:549:17)
            at processTimers (internal/timers.js:492:7),
        Error: task: 2 Fail!!!
            at Timeout._onTimeout (repl:9:24)
            at listOnTimeout (internal/timers.js:549:17)
            at processTimers (internal/timers.js:492:7),
        Error: task: 3 Fail!!!
            at Timeout._onTimeout (repl:9:24)
            at listOnTimeout (internal/timers.js:549:17)
            at processTimers (internal/timers.js:492:7),
        Error: task: 4 Fail!!!
            at Timeout._onTimeout (repl:9:24)
            at listOnTimeout (internal/timers.js:549:17)
            at processTimers (internal/timers.js:492:7)
      ],
      condition: 'all_not',
      extra_err_msg: undefined
    }
    >
    */


    var funcs = Array.from({length:5}).map(r=>creat_random_task)
    var params = Array.from({length:5}).map((r,i)=>[i])
    var f = notandor.all_not(funcs,params)
    var p = f()

    /*
    > p
    Promise {
      <rejected> 'task: 4 Success',
      condition: 'all_not',
      extra_err_msg: undefined
    }
    >
    */


any
---

    var funcs = Array.from({length:3}).map(r=>creat_random_task)
    var params = Array.from({length:3}).map((r,i)=>[i])
    var f = notandor.any(funcs,params)
    var p = f()

    /*
    > p
    Promise {
      'task: 2 Success',
      condition: 'any',
      extra_err_msg: undefined
    }
    >

    */


    var funcs = Array.from({length:3}).map(r=>creat_fail_task)
    var params = Array.from({length:3}).map((r,i)=>[i])
    var f = notandor.any(funcs,params)
    var p = f()

    /*
    > p
    Promise {
      <rejected> [
        Error: task: 0 Fail!!!
            at Timeout._onTimeout (repl:11:28)
            at listOnTimeout (internal/timers.js:549:17)
            at processTimers (internal/timers.js:492:7),
        Error: task: 1 Fail!!!
            at Timeout._onTimeout (repl:11:28)
            at listOnTimeout (internal/timers.js:549:17)
            at processTimers (internal/timers.js:492:7),
        Error: task: 2 Fail!!!
            at Timeout._onTimeout (repl:11:28)
            at listOnTimeout (internal/timers.js:549:17)
            at processTimers (internal/timers.js:492:7)
      ],
      condition: 'any',
      extra_err_msg: undefined
    }
    >
    */


any\_not
--------
    
    var funcs = Array.from({length:3}).map(r=>creat_random_task)
    var params = Array.from({length:3}).map((r,i)=>[i])
    var f = notandor.any_not(funcs,params)
    var p = f()
    
    /*
    > p
    Promise {
      Error: task: 2 Fail!!!
          at Timeout._onTimeout (repl:11:28)
          at listOnTimeout (internal/timers.js:549:17)
          at processTimers (internal/timers.js:492:7),
      condition: 'any_not',
      extra_err_msg: undefined
    }
    >
    
    */
    
    
    var funcs = Array.from({length:3}).map(r=>creat_success_task)
    var params = Array.from({length:3}).map((r,i)=>[i])
    var f = notandor.any_not(funcs,params)
    var p = f()
    
    /*
    > p
    Promise {
      <rejected> [ 'task: 0 Success', 'task: 1 Success', 'task: 2 Success' ],
      condition: 'any_not',
      extra_err_msg: undefined
    }
    >
    
    */


at\_least\_some
---------------

    var funcs = Array.from({length:4}).map(r=>creat_random_task)
    var params = Array.from({length:4}).map((r,i)=>[i])
    var f = notandor.at_least_some(funcs,params)
    var p = f(3)  //at least 3 resolved
    
    /*
        > p
        Promise {
          [ 'task: 1 Success', 'task: 2 Success', 'task: 3 Success' ],
          condition: 'at_least_some\n arguments: 3',
          extra_err_msg: undefined
        }
        >
    */
    
    
    var funcs = Array.from({length:4}).map(r=>creat_random_task)
    var params = Array.from({length:4}).map((r,i)=>[i])
    var f = notandor.at_least_some(funcs,params)
    var p = f(3) //at least 3 resolved
    
    /*
    > p
    Promise {
      <rejected> [
        Error: task: 1 Fail!!!
            at Timeout._onTimeout (repl:11:28)
            at listOnTimeout (internal/timers.js:549:17)
            at processTimers (internal/timers.js:492:7),
        Error: task: 2 Fail!!!
            at Timeout._onTimeout (repl:11:28)
            at listOnTimeout (internal/timers.js:549:17)
            at processTimers (internal/timers.js:492:7)
      ],
      condition: 'at_least_some\n arguments: 3',
      extra_err_msg: undefined
    }
    >
    */


at\_least\_some\_not
--------------------

    var funcs = Array.from({length:4}).map(r=>creat_random_task)
    var params = Array.from({length:4}).map((r,i)=>[i])
    var f = notandor.at_least_some_not(funcs,params)
    var p = f(3)  //at least 3 resolved

    /*
        > p
        Promise {
          [
            Error: task: 1 Fail!!!
                at Timeout._onTimeout (repl:11:28)
                at listOnTimeout (internal/timers.js:549:17)
                at processTimers (internal/timers.js:492:7),
            Error: task: 2 Fail!!!
                at Timeout._onTimeout (repl:11:28)
                at listOnTimeout (internal/timers.js:549:17)
                at processTimers (internal/timers.js:492:7),
            Error: task: 3 Fail!!!
                at Timeout._onTimeout (repl:11:28)
                at listOnTimeout (internal/timers.js:549:17)
                at processTimers (internal/timers.js:492:7)
          ],
          condition: 'at_least_some_not\n arguments: 3',
          extra_err_msg: undefined
        }
        >
    */


    var funcs = Array.from({length:4}).map(r=>creat_random_task)
    var params = Array.from({length:4}).map((r,i)=>[i])
    var f = notandor.at_least_some_not(funcs,params)
    var p = f(3) //at least 3 resolved
    /*
        > p
        Promise {
          <rejected> [ 'task: 0 Success', 'task: 1 Success' ],
          condition: 'at_least_some_not\n arguments: 3',
          extra_err_msg: 'already-2-resolved:at_least-3-rejected'
        }
        >
    */

must\_some
------------


    var funcs = Array.from({length:4}).map(r=>creat_random_task)
    var params = Array.from({length:4}).map((r,i)=>[i])
    var f = notandor.must_some(funcs,params)
    var p = f(2)  //must 2 resolved

    /*
    > p
    Promise {
      [ 'task: 0 Success', 'task: 3 Success' ],
      condition: 'must_some\n arguments: 2',
      extra_err_msg: undefined
    }
    > p.$stats
    [
      {
        state: 'resolved',
        rslt: 'task: 0 Success',
        exception: undefined,
        index: 0,
        arguments: [ [Array], [Array], [Array], [Array] ],
        func: [Function: creat_random_task]
      },
      {
        state: 'rejected',
        rslt: undefined,
        exception: Error: task: 1 Fail!!!
            at Timeout._onTimeout (repl:11:28)
            at listOnTimeout (internal/timers.js:549:17)
            at processTimers (internal/timers.js:492:7),
        index: 1,
        arguments: [ [Array], [Array], [Array], [Array] ],
        func: [Function: creat_random_task]
      },
      {
        state: 'rejected',
        rslt: undefined,
        exception: Error: task: 2 Fail!!!
            at Timeout._onTimeout (repl:11:28)
            at listOnTimeout (internal/timers.js:549:17)
            at processTimers (internal/timers.js:492:7),
        index: 2,
        arguments: [ [Array], [Array], [Array], [Array] ],
        func: [Function: creat_random_task]
      },
      {
        state: 'resolved',
        rslt: 'task: 3 Success',
        exception: undefined,
        index: 3,
        arguments: [ [Array], [Array], [Array], [Array] ],
        func: [Function: creat_random_task]
      }
    ]
    >
    */


    var funcs = Array.from({length:4}).map(r=>creat_random_task)
    var params = Array.from({length:4}).map((r,i)=>[i])
    var f = notandor.must_some(funcs,params)
    var p = f(3) //must 3 resolved
    /*
    > p
    Promise {
      <rejected> [
        Error: task: 0 Fail!!!
            at Timeout._onTimeout (repl:11:28)
            at listOnTimeout (internal/timers.js:549:17)
            at processTimers (internal/timers.js:492:7),
        Error: task: 2 Fail!!!
            at Timeout._onTimeout (repl:11:28)
            at listOnTimeout (internal/timers.js:549:17)
            at processTimers (internal/timers.js:492:7)
      ],
      condition: 'must_some\n arguments: 3',
      extra_err_msg: 'already-2-rejected:at_least-3-resolved'
    }
    >

    */

must\_some\_not
-----------------

    var funcs = Array.from({length:4}).map(r=>creat_random_task)
    var params = Array.from({length:4}).map((r,i)=>[i])
    var f = notandor.must_some_not(funcs,params)
    var p = f(2)  //must 2 rejected

    /*
        > p
        Promise {
          [
            Error: task: 1 Fail!!!
                at Timeout._onTimeout (repl:11:28)
                at listOnTimeout (internal/timers.js:549:17)
                at processTimers (internal/timers.js:492:7),
            Error: task: 3 Fail!!!
                at Timeout._onTimeout (repl:11:28)
                at listOnTimeout (internal/timers.js:549:17)
                at processTimers (internal/timers.js:492:7)
          ],
          condition: 'must_some_not\n arguments: 2',
          extra_err_msg: undefined
        }
        >

    */


    var funcs = Array.from({length:4}).map(r=>creat_random_task)
    var params = Array.from({length:4}).map((r,i)=>[i])
    var f = notandor.must_some_not(funcs,params)
    var p = f(3) //must 3 rejected
    /*
        > p
        Promise {
          <rejected> [ 'task: 0 Success', 'task: 2 Success' ],
          condition: 'must_some_not\n arguments: 3',
          extra_err_msg: 'already-2-resolved:at_least-3-rejected'
        }
        >
    */

one
---
    
    #equals to 
    notandor.must_some(funcs,params)
    var p = f(1)  

one\_not
--------
    #equals to
    notandor.must_some_not(funcs,params)
    var p = f(1)



at\_least\_certain
------------------


    var funcs = Array.from({length:3}).map(r=>creat_random_task)
    var params = Array.from({length:3}).map((r,i)=>[i])
    var f = notandor.at_least_certain(funcs,params)
    var p = f(0,2)  //at least [0,2] resolved

    /*
        > p
        Promise {
          [ 'task: 0 Success', 'task: 2 Success' ],
          condition: 'at_least_certain\n arguments: 0,2',
          extra_err_msg: undefined
        }
        >
    */


    var funcs = Array.from({length:3}).map(r=>creat_random_task)
    var params = Array.from({length:3}).map((r,i)=>[i])
    var f = notandor.at_least_certain(funcs,params)
    var p = f(0,2) //at least [0,2] resolved
    /*
        > p
        Promise {
          <rejected> Error: task: 2 Fail!!!
              at Timeout._onTimeout (repl:11:28)
              at listOnTimeout (internal/timers.js:549:17)
              at processTimers (internal/timers.js:492:7),
          condition: 'at_least_certain\n arguments: 0,2',
          extra_err_msg: 'all-in-0,2-must-be-resolved:but-2-is-rejected'
        }
        >
    */


at\_least\_certain\_not
-----------------------

    var funcs = Array.from({length:3}).map(r=>creat_random_task)
    var params = Array.from({length:3}).map((r,i)=>[i])
    var f = notandor.at_least_certain_not(funcs,params)
    var p = f(0,2)  //at least [0,2] rejected
    /*
        > p
        Promise {
          [
            Error: task: 0 Fail!!!
                at Timeout._onTimeout (repl:11:28)
                at listOnTimeout (internal/timers.js:549:17)
                at processTimers (internal/timers.js:492:7),
            Error: task: 2 Fail!!!
                at Timeout._onTimeout (repl:11:28)
                at listOnTimeout (internal/timers.js:549:17)
                at processTimers (internal/timers.js:492:7)
          ],
          condition: 'at_least_certain_not\n arguments: 0,2',
          extra_err_msg: undefined
        }
        >

    */


    var funcs = Array.from({length:3}).map(r=>creat_random_task)
    var params = Array.from({length:3}).map((r,i)=>[i])
    var f = notandor.at_least_certain_not(funcs,params)
    var p = f(0,2) //at least [0,2] rejected
    /*
        > p
        Promise {
          <rejected> 'task: 0 Success',
          condition: 'at_least_certain_not\n arguments: 0,2',
          extra_err_msg: 'all-in-0,2-must-be-rejected:but-0-is-resolved'
        }
        >
    */


must\_certain
---------------


    var funcs = Array.from({length:3}).map(r=>creat_random_task)
    var params = Array.from({length:3}).map((r,i)=>[i])
    var f = notandor.must_certain(funcs,params)
    var p = f(0,2)  //must [0,2] resolved  [1] rejected

    /*
        > p
        Promise {
          [
            'task: 0 Success',
            Error: task: 1 Fail!!!
                at Timeout._onTimeout (repl:11:28)
                at listOnTimeout (internal/timers.js:549:17)
                at processTimers (internal/timers.js:492:7),
            'task: 2 Success'
          ],
          condition: 'must_certain\n arguments: 0,2',
          extra_err_msg: undefined
        }
        >
    */


    var funcs = Array.from({length:2}).map(r=>creat_random_task)
    var params = Array.from({length:2}).map((r,i)=>[i])
    var f = notandor.must_certain(funcs,params)
    var p = f(0,2) //must [0,2] resolved  [1] rejected
    /*
        > p
        Promise {
          <rejected> 'task: 1 Success',
          condition: 'must_certain\n arguments: 0,2',
          extra_err_msg: 'index-in-resolved-must-be-rejected:but-1-resolved'
        }
        >
    */


must\_certain\_not
--------------------

    var funcs = Array.from({length:3}).map(r=>creat_random_task)
    var params = Array.from({length:3}).map((r,i)=>[i])
    var f = notandor.must_certain_not(funcs,params)
    var p = f(0,2)  //must [0,2] rejected  [1] resolved

    /*
        > p
        Promise {
          [
            Error: task: 0 Fail!!!
                at Timeout._onTimeout (repl:11:28)
                at listOnTimeout (internal/timers.js:549:17)
                at processTimers (internal/timers.js:492:7),
            'task: 1 Success',
            Error: task: 2 Fail!!!
                at Timeout._onTimeout (repl:11:28)
                at listOnTimeout (internal/timers.js:549:17)
                at processTimers (internal/timers.js:492:7)
          ],
          condition: 'must_certain_not\n arguments: 0,2',
          extra_err_msg: undefined
        }
        >

    */


    var funcs = Array.from({length:2}).map(r=>creat_random_task)
    var params = Array.from({length:2}).map((r,i)=>[i])
    var f = notandor.must_certain(funcs,params)
    var p = f(0,2) //must [0,2] rejected  [1] resolved
    /*
        > p
        Promise {
          <rejected> Error: task: 1 Fail!!!
              at Timeout._onTimeout (repl:11:28)
              at listOnTimeout (internal/timers.js:549:17)
              at processTimers (internal/timers.js:492:7),
          condition: 'must_certain_not\n arguments: 0,2',
          extra_err_msg: 'index-in-rejected-must-be-resolved:but-1-rejected'
        }
        >
        >
    */

all\_settled
------------

    var funcs = Array.from({length:3}).map(r=>creat_random_task)
    var params = Array.from({length:3}).map((r,i)=>[i])
    var f = notandor.all_settled(funcs,params)
    var p = f()  
    
    /*
        > p
        Promise {
          [
            Error: task: 0 Fail!!!
                at Timeout._onTimeout (repl:11:28)
                at listOnTimeout (internal/timers.js:549:17)
                at processTimers (internal/timers.js:492:7),
            'task: 1 Success',
            Error: task: 2 Fail!!!
                at Timeout._onTimeout (repl:11:28)
                at listOnTimeout (internal/timers.js:549:17)
                at processTimers (internal/timers.js:492:7)
          ],
          condition: 'all_settled',
          extra_err_msg: undefined
        }
        >
    */


any\_settled
------------

    
    var funcs = Array.from({length:2}).map(r=>creat_random_task)
    var params = Array.from({length:2}).map((r,i)=>[i])
    var f = notandor.any_settled(funcs,params)
    var p = f() 
    /*
        > p
        Promise {
          'task: 0 Success',
          condition: 'any_settled',
          extra_err_msg: undefined
        }
        >
    */
    var p = f()
    /*
        > p
        Promise {
          Error: task: 0 Fail!!!
              at Timeout._onTimeout (repl:11:28)
              at listOnTimeout (internal/timers.js:549:17)
              at processTimers (internal/timers.js:492:7),
          condition: 'any_settled',
          extra_err_msg: undefined
        }
        >
    */


at\_least\_some\_settled
------------------------

    var funcs = Array.from({length:3}).map(r=>creat_random_task)
    var params = Array.from({length:3}).map((r,i)=>[i])
    var f = notandor.at_least_some_settled(funcs,params)
    var p = f(2)   // at_least 2 settled

    /*
        > p
        Promise {
          [
            'task: 1 Success',
            Error: task: 2 Fail!!!
                at Timeout._onTimeout (repl:11:28)
                at listOnTimeout (internal/timers.js:549:17)
                at processTimers (internal/timers.js:492:7)
          ],
          condition: 'at_least_some_settled\n arguments: 2',
          extra_err_msg: undefined
        }
        >
    */

at\_least\_certain\_settled
---------------------------

    var funcs = Array.from({length:4}).map(r=>creat_random_task)
    var params = Array.from({length:4}).map((r,i)=>[i])
    var f = notandor.at_least_certain_settled(funcs,params)
    var p = f(1,3)   // at_least [1,3] settled
    /*
        > p
        Promise {
          [
            Error: task: 1 Fail!!!
                at Timeout._onTimeout (repl:11:28)
                at listOnTimeout (internal/timers.js:549:17)
                at processTimers (internal/timers.js:492:7),
            'task: 3 Success'
          ],
          condition: 'at_least_certain_settled\n arguments: 1,3',
          extra_err_msg: undefined
        }
        >
    */


self-define-condition
---------------------

    const noa = require('not-and-or')
    const notandor = require('notandor-promise')
    
    //define a condition
    //if any-odd-index-resolved,success
    //if any-even-index-rejected,success
    // others fail
    
    function cond_func(p,i,...params) {
        /*
            p--------------------------------------->
            --->returned promise,not-for-each-task
            --->p is for final result
            ####################
            i--------------------------------------->each task index
            p.$stats[i]----------------------------->each task stat
            p.$stats[i].state----------------------->each task state 'pending'|'resolved'|'rejected'
            p.$stats[i].rslt-------------> if resolved, store result; else undefined 
            p.$stats[i].exception--------> if rejected, store exception; else undefined
            ####################
            notandor.STATE_KEY_MD
            notandor.reject_outer(p,exception)   ---> trigger reject
            notandor.resolve_outer(p,rslt)       ---> trigger resolve
            p.$stats ------------------------------->  task_functions container
            
        */
        let state = p.$stats[i].state
        let cond0 = (i%2 === 1)
        let cond1 = state ===  'resolved'
        let cond2 = (i%2 === 0)
        let cond3 = state ===  'rejected'
        let cond = noa.or(
            noa.and(cond0,cond1),
            noa.and(cond2,cond3)
        )
        let key = notandor.STATE_KEY_MD[state]
        if(cond) {
            notandor.resolve_outer(p,p.$stats[i][key])
        } else {
            notandor.reject_outer(p,p.$stats[i][key])
        }
    }
    

    var funcs = Array.from({length:4}).map(r=>creat_random_task)
    var params = Array.from({length:4}).map((r,i)=>[i])
    var f = notandor.wrap(funcs,params,cond_func)
    var p = f()   
    /*
        > p
        Promise {
          'task: 1 Success',
          condition: 'function cond_func(p,i,...params) {\n' +
            '        /*\n' +
            '            notandor.reject_outer(p,exception)\n' +
            '            notandor.resolve_outer(p,rslt)\n' +
            '            p.$stats\n' +
            '            \n' +
            '        */\n' +
            '        let state = p.$stats[i].state\n' +
            '        let cond0 = (i%2 === 1)\n' +
            "        let cond1 = state ===  'resolved'\n" +
            '        let cond2 = (i%2 === 0)\n' +
            "        let cond3 = state ===  'rejected'\n" +
            '        let cond = noa.or(\n' +
            '            noa.and(cond0,cond1),\n' +
            '            noa.and(cond2,cond3)\n' +
            '        )\n' +
            '        let key = notandor.STATE_KEY_MD[state]\n' +
            '        if(cond) {\n' +
            '            notandor.resolve_outer(p,p.$stats[i][key])\n' +
            '        } else {\n' +
            '            notandor.reject_outer(p,p.$stats[i][key])\n' +
            '        }\n' +
            '    }',
          extra_err_msg: undefined
        }
        >
    */
    var p = f()
    /*
        Promise {
          <rejected> Error: task: 1 Fail!!!
              at Timeout._onTimeout (repl:11:28)
              at listOnTimeout (internal/timers.js:549:17)
              at processTimers (internal/timers.js:492:7),
          condition: 'function cond_func(p,i,...params) {\n' +
            '        /*\n' +
            '            notandor.reject_outer(p,exception)\n' +
            '            notandor.resolve_outer(p,rslt)\n' +
            '            p.$stats\n' +
            '            \n' +
            '        */\n' +
            '        let state = p.$stats[i].state\n' +
            '        let cond0 = (i%2 === 1)\n' +
            "        let cond1 = state ===  'resolved'\n" +
            '        let cond2 = (i%2 === 0)\n' +
            "        let cond3 = state ===  'rejected'\n" +
            '        let cond = noa.or(\n' +
            '            noa.and(cond0,cond1),\n' +
            '            noa.and(cond2,cond3)\n' +
            '        )\n' +
            '        let key = notandor.STATE_KEY_MD[state]\n' +
            '        if(cond) {\n' +
            '            notandor.resolve_outer(p,p.$stats[i][key])\n' +
            '        } else {\n' +
            '            notandor.reject_outer(p,p.$stats[i][key])\n' +
            '        }\n' +
            '    }',
          extra_err_msg: undefined
        }
    */


add\_str\_cond
--------------

    #you can also register self-defined-condition to string-condition 
    notandor.add_str_cond("even_fail_odd_succ",cond_func);
    var f = notandor.even_fail_odd_succ(funcs,params);
    var p = f()
    /*
    > p
        Promise {
          Error: task: 0 Fail!!!===========================>even task rejected will trigger success
              at Timeout._onTimeout (repl:11:28)
              at listOnTimeout (internal/timers.js:549:17)
              at processTimers (internal/timers.js:492:7),
          condition: 'even_fail_odd_succ',
          extra_err_msg: undefined
        }
        >
    */


APIS
====

    {
      STATES: [ 'pending', 'resolved', 'rejected' ],
      STATE_KEY_MD: {
        resolved: 'rslt',
        rejected: 'exception',
        rslt: 'resolved',
        exception: 'rejected'
      },
      get_anti_key_with_cond_state:'resolved'->'exception', 'rejected'->'rslt'
      get_anti_state: 'resolved'->'rejected', 'rejected'->'resolved',
      resolve_outer:(p:Promise,rslt:any)->,
      reject_outer: (p:Promise,exception:Error)->,
      wrap: (task_funcs:Array<Function>,task_params:Array<Array<any>>,self_defined_function_or_cond_str)->Function,
      add_str_cond: (name:string,self_defined_function:Function)-> 
      ////
      all: (...params)->Promise,
      all_not: (...params)->Promise,
      any: (...params)->Promise,
      any_not: (...params)->Promise,
      at_least_some: (...params)->Promise,
      at_least_some_not: (...params)->Promise,
      must_some: (...params)->Promise,
      must_some_not: (...params)->Promise,
      one: (...params)->Promise,
      one_not: (...params)->Promise,
      at_least_certain: (...params)->Promise,
      at_least_certain_not: (...params)->Promise,
      must_certain: (...params)->Promise,
      must_certain_not: (...params)->Promise,
      all_settled: (...params)->Promise,
      any_settled: (...params)->Promise,
      at_least_some_settled: (...params)->Promise,
      at_least_certain_settled: (...params)->Promise
    }


LICENSE
=======
- MIT 
