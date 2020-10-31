const nao = require('not-and-or') 

const STATES = ['pending','resolved','rejected']

function is_function(o) {return(typeof(o) === 'function')}

function resolve_outer(p,rslt) {
    p.$resolve(rslt);
    p.state = 'resolved';
    p.rslt = rslt;
}

function reject_outer(p,exception) {
    p.$reject(exception);
    p.state = 'rejected';
    p.exception = exception;
}

const STATE_KEY_MD = {
    resolved:"rslt",
    rejected:"exception",
    rslt:"resolved",
    exception:"rejected"
}

function get_anti_state(cond_state) {
    if(cond_state === "resolved") {
        return("rejected")
    } else {
        return("resolved")
    }
}


function get_anti_key_with_cond_state(cond_state) {
    let anti_state = get_anti_state(cond_state)
    return(STATE_KEY_MD[anti_state])
}

function all_engine(p,index,n_or_certain,cf,cond_state) {
    let stats = p.$stats
    let states = stats.map(r=>r.state)
    if(states[index] === cond_state) {
        let cond = cf(...stats.map(r=>r.state===cond_state))
        if(cond){
            let k = STATE_KEY_MD[cond_state]
            let rslt = stats.map(r=>r[k]);
            resolve_outer(p,rslt);
            return;
        }
    } else {
        let k = get_anti_key_with_cond_state(cond_state)
        let exception = stats[index][k];
        reject_outer(p,exception);
        return;
    }    
}

function all(p,index,...cu_params) {
    let n_or_certain = cu_params[0];
    return(all_engine(p,index,n_or_certain,nao.all,'resolved'))
}

function all_not(p,index,...cu_params) {
    let n_or_certain = cu_params[0];
    return(all_engine(p,index,n_or_certain,nao.all,'rejected'))
}

function any_engine(p,index,n_or_certain,cf,cond_state) {
    let stats = p.$stats
    let states = stats.map(r=>r.state)
    if(states[index] === cond_state) {
        let k = STATE_KEY_MD[cond_state]
        let rslt = stats[index][k]; 
        resolve_outer(p,rslt);
        return;
    } else {
    }
    let cond = is_all_settled(states)
    if(cond) {
        let anti_state = get_anti_state(cond_state);
        let rejected = stats.filter(r=>r.state === anti_state)
        let key = get_anti_key_with_cond_state(cond_state);
        let exception = rejected.map(r=>r[key]);
        reject_outer(p,exception);
        return;
    } else {
    }
}


function any(p,index,...cu_params) {
    let n_or_certain = cu_params[0];
    return(any_engine(p,index,n_or_certain,nao.any,'resolved'))
}

function any_not(p,index,...cu_params) {
    let n_or_certain = cu_params[0];
    return(any_engine(p,index,n_or_certain,nao.any,'rejected'))
}

function is_all_settled(states) {
    let settled = states.filter(r=>r!== 'pending').length === states.length 
    return(settled)
}


function some_check(states,n_or_certain,cond_state) {
    let lefted = (states.filter(r=>r==='pending')).length
    let c = (states.filter(r=>r===cond_state)).length
    let cond = (c + lefted) >= n_or_certain
    if(cond) {
        return(true)
    } else {
        return(false)
    }
}

function creat_extra(anti_count,anti_state,required_count,required_state,midfix) {
    let tem = `already-${anti_count}-${anti_state}:${midfix}-${required_count}-${required_state}`
    return(tem)
}

function check_still_enough_for_at_least_some(stats,states,p,n_or_certain,cond_state) {
    //先检查 剩余的 + 当前resolved 的是否够 n_or_certain
    let is_still_enough = some_check(states,n_or_certain,cond_state);
    if(is_still_enough) {
        return(true)
    } else {
        //不够的话直接返回 所有 rejected, extra 置为
        let anti_state = get_anti_state(cond_state);
        let anti_count = states.filter(r=>r===anti_state).length;
        let extra = creat_extra(anti_count,anti_state,n_or_certain,cond_state,'at_least');
        p.extra_err_msg = extra
        let rejected = stats.filter(r=>r.state === anti_state)
        let key = get_anti_key_with_cond_state(cond_state);
        let exception = rejected.map(r=>r[key]);
        reject_outer(p,exception);
        return(false)
    }
    ////////
}


function engine_of_at_least_some(p,index,n_or_certain,cf,cond_state) {
    let stats = p.$stats
    let states = stats.map(r=>r.state)
    ////
    if(n_or_certain > states.length) {
        let rejected = new Error(`total-task-count-is-${states.length}:but-require-at-least-${n_or_certain}-to-be-${cond_state}`);
        let exception = rejected;
        reject_outer(p,exception);
        return;
    } else {}
    ////
    //先检查 剩余的 + 当前resolved 的是否够 n_or_certain
    let cond = check_still_enough_for_at_least_some(stats,states,p,n_or_certain,cond_state);
    if(cond){} else {return}
    ////////
    if(states[index] === cond_state) {
        let cond = cf(n_or_certain,...stats.map(r=>r.state===cond_state))
        if(cond){
            let resolved = stats.filter(r=>r.state === cond_state);
            let key = STATE_KEY_MD[cond_state];
            let rslt = resolved.map(r=>r[key]);
            resolve_outer(p,rslt);
            return;
        } else {
        }
    } else {
        let cond = is_all_settled(states)
        if(cond) {
            let cond = cf(n_or_certain,...stats.map(r=>r.state===cond_state))
            if(cond){
                let resolved = stats.filter(r=>r.state === cond_state)
                let key = STATE_KEY_MD[cond_state];
                let rslt = resolved.map(r=>r[key]);
                resolve_outer(p,rslt);
                return;
            } else {
                let anti_state = get_anti_state(cond_state);
                let rejected = stats.filter(r=>r.state === anti_state);
                let key = get_anti_key_with_cond_state(cond_state);
                let exception = rejected.map(r=>r[key]);
                reject_outer(p,exception);
                return;
            }
        } else {
        }
    }
}


function at_least_some(p,index,...cu_params) { 
    let n_or_certain = cu_params[0];
    return(engine_of_at_least_some(p,index,n_or_certain,nao.at_least_some,'resolved'))
}
function at_least_some_not(p,index,...cu_params) { 
    let n_or_certain = cu_params[0];
    return(engine_of_at_least_some(p,index,n_or_certain,nao.at_least_some,'rejected'))
}


function engine_of_must_some(p,index,n_or_certain,cf,cond_state) {
    let stats = p.$stats
    let states = stats.map(r=>r.state)
    ////
    if(n_or_certain > states.length) {
        let rejected = new Error(`total-task-count-is-${states.length}:but-require-${n_or_certain}-to-be-${cond_state}`);
        let exception = rejected;
        reject_outer(p,exception);
        return;
    } else {}
    ////
    //先检查 剩余的 + 当前resolved 的是否够 n_or_certain
    let is_enough_lefted = check_still_enough_for_at_least_some(stats,states,p,n_or_certain,cond_state,'must');
    if(is_enough_lefted){} else {return};    
    ////////
    let cond = is_all_settled(states);
    if(cond) {
        let cond = cf(n_or_certain,...stats.map(r=>r.state===cond_state))
        if(cond) {
            let resolved = stats.filter(r=>r.state === cond_state);
            let key = STATE_KEY_MD[cond_state];
            let rslt = resolved.map(r=>r[key]);
            resolve_outer(p,rslt);
            return;
        } else {
            let curr_resolved_num = stats.map(r=>r.state===cond_state).length;
            if(curr_resolved_num < n_or_certain) {
                let anti_state = get_anti_state(cond_state);
                let anti_count = states.map(r=>r===anti_state);
                let extra = creat_extra(anti_count,anti_state,n_or_certain,cond_state,'must');
                p.extra_err_msg = extra
                let rejected = stats.filter(r=>r.state === anti_state);
                let key = get_anti_key_with_cond_state(cond_state);
                let exception = rejected.map(r=>r.exception);
                reject_outer(p,exception);
                return;
            } else {
                let extra = creat_extra(anti_count,cond_state,n_or_certain,cond_state,'must');
                p.extra_err_msg = extra
                let rejected = stats.filter(r=>r.state === cond_state);
                let key = STATE_KEY_MD[cond_state];
                let exception = rejected.map(r=>r[key]);
                reject_outer(p,exception);
                return;                
            }
        }
    } else {
    }
}


function must_some(p,index,...cu_params) {
    let n_or_certain = cu_params[0];
    return(engine_of_must_some(p,index,n_or_certain,nao.must_some,'resolved'))
}

function must_some_not(p,index,...cu_params) {
    //also nao.at_least_some  ,coz undefined
    let n_or_certain = cu_params[0];
    return(engine_of_must_some(p,index,n_or_certain,nao.must_some,'rejected'))
}

function one(p,index,...cu_params) {
    let n_or_certain = cu_params[0];
    return(engine_of_must_some(p,index,1,nao.must_some,'resolved'))
}

function one_not(p,index,...cu_params) {
    //also nao.at_least_some  ,coz undefined
    let n_or_certain = cu_params[0];
    return(engine_of_must_some(p,index,1,nao.must_some,'rejected'))
}



function is_all_certain_matched(states,n_or_certain,cond_state) {
    states = states.filter(
        (r,i) => (n_or_certain.includes(i))
    )
    let cond = nao.all(...states.map(r=>r === cond_state));
    return(cond)
}


function creat_certain_extra(n_or_certain,i,anti_state,required_state,midfix) {
    let tem = `all-in-${n_or_certain}-must-be-${required_state}:but-${i}-is-${anti_state}`
    return(tem)
}

function check_certain_indexes_in_range(states,n_or_certain) {
    let cond = n_or_certain.every(r=>(r>=0 && r<states.length))
    return(cond)
}


function engine_of_at_least_certain(p,index,n_or_certain,cf,cond_state) {
    let stats = p.$stats
    let states = stats.map(r=>r.state);
    ////
    if(n_or_certain > states.length) {
        let rejected = new Error(`total-task-count-is-${states.length}:but-require-at-least-${n_or_certain}-to-be-${cond_state}`);
        let exception = rejected;
        reject_outer(p,exception);
        return;
    } else {}
    ////
    let in_range = check_certain_indexes_in_range(states,n_or_certain);
    if(in_range) {} else {
        let rejected = new Error(`total-task-count-is-${states.length}:but-require-at-least-${n_or_certain}-to-be-${cond_state}`);
        let exception = rejected;
        reject_outer(p,exception);
        return;
    }
    ////
    let cond = n_or_certain.includes(index);
    if(cond) {
        let cond = stats[index].state === cond_state;
        if(cond) {
            //如果满足,检查是否 all_certain_matched
            let cond = is_all_certain_matched(states,n_or_certain,cond_state);
            if(cond) {
                //完事了,可以返回
                let resolved = stats.filter((r,i)=>(r.state === cond_state)&&n_or_certain.includes(i));
                let key = STATE_KEY_MD[cond_state];
                let rslt = resolved.map(r=>r[key]);
                resolve_outer(p,rslt);
                return;
            } else {
                //什么也不做
            }
        } else {
            //有一个失败就返回
            let anti_state = get_anti_state(cond_state);
            let key = get_anti_key_with_cond_state(cond_state);
            let rejected = stats[index];
            let exception = rejected[key];
            let extra = creat_certain_extra(n_or_certain,index,anti_state,cond_state);
            p.extra_err_msg = extra; 
            reject_outer(p,exception);
            return;
        }
    } else {
        //不关心的什么也不做
    }
}

function at_least_certain(p,index,...cu_params) {
    let n_or_certain = cu_params;
    engine_of_at_least_certain(p,index,n_or_certain,undefined,'resolved');
}
function at_least_certain_not(p,index,...cu_params) {
    let n_or_certain = cu_params;
    engine_of_at_least_certain(p,index,n_or_certain,undefined,'rejected');
}

////


function creat_must_certian_extra(in_certian,states,n_or_certain,index,anti_state,cond_state) {
    let not_n_or_certain = states.filter((r,i)=>!n_or_certain.includes(i))
    let tem =``
    if(in_certian) {
        //
        tem = `index-in-${n_or_certain}-must-be-${cond_state}:but-${index}-${anti_state}`
    } else {
        tem = `index-in-${not_n_or_certain}-must-be-${anti_state}:but-${index}-${cond_state}`
    }
    return(tem)
}




function must_certain_check(in_certain,states,n_or_certain,curr,S,stats,index,anti_state,cond_state) {
    let cond = (curr.state ===  S)
    if(cond) {
        return(true)
    } else {
        let rejected = stats[index];
        let exception = rejected[get_anti_key_with_cond_state(S)];
        let extra = creat_must_certian_extra(in_certain,states,n_or_certain,index,anti_state,cond_state);
        p.extra_err_msg = extra;
        reject_outer(p,exception);
        return(false)
    }
    
}


function engine_of_must_certain(p,index,n_or_certain,cf,cond_state) {
    let stats = p.$stats
    let states = stats.map(r=>r.state);
    ////
    if(n_or_certain > states.length) {
        let rejected = new Error(`total-task-count-is-${states.length}:but-require-at-least-${n_or_certain}-to-be-${cond_state}`);
        let exception = rejected;
        reject_outer(p,exception);
        return;
    } else {}
    ////
    ////
    let in_range = check_certain_indexes_in_range(states,n_or_certain);
    if(in_range) {} else {
        let rejected = new Error(`total-task-count-is-${states.length}:but-require-at-least-${n_or_certain}-to-be-${cond_state}`);
        let exception = rejected;
        reject_outer(p,exception);
        return;
    }
    ////
    let curr = stats[index]
    let anti_state = get_anti_state(cond_state);
    let cond_key = STATE_KEY_MD[cond_state]; 
    let anti_key = get_anti_key_with_cond_state(cond_state);
    let in_certain = n_or_certain.includes(index);
    let check_rslt;
    if(in_certain) {
        check_rslt = must_certain_check(in_certain,states,n_or_certain,curr,cond_state,stats,index,anti_state,cond_state);
    } else {
        check_rslt = must_certain_check(in_certain,states,n_or_certain,curr,anti_state,stats,index,anti_state,cond_state);
    }
    if(check_rslt) {} else {return;}
    if(is_all_settled(states)) {
        let resolved = stats;
        let rslt = stats.map(
            r=> (r.state === cond_state)?r[cond_key]:r[anti_key]
        )
        resolve_outer(p,rslt);
        return;
    } else {
        //不会发生
    }
}

function must_certain(p,index,...cu_params) { 
    let n_or_certain = cu_params;
    engine_of_must_certain(p,index,n_or_certain,undefined,'resolved');
}

function must_certain_not(p,index,...cu_params) { 
    let n_or_certain = cu_params;
    engine_of_must_certain(p,index,n_or_certain,undefined,'rejected');
}


function is_settled(state) {return(state!=='pending')}

function engine_of_all_settled(p,index,n_or_certain,cf,cond_state) {
    let stats = p.$stats
    let states = stats.map(r=>r.state)
    let cond = is_all_settled(states)
    let cond_key = STATE_KEY_MD[cond_state];
    let anti_key = get_anti_key_with_cond_state(cond_state);
    if(cond) {
        let resolved = stats;
        let rslt = stats.map(
            r => (r.state === cond_state)?r[cond_key]:r[anti_key]
        )
        resolve_outer(p,rslt);
        return;
    } else {
    }
}

function all_settled(p,index,...cu_params) {engine_of_all_settled(p,index,undefined,undefined,'resolved')}

function engine_of_any_settled(p,index,n_or_certain,cf,cond_state) {
    let stats = p.$stats
    let states = stats.map(r=>r.state)
    if(is_settled(states[index])) {
        let k = STATE_KEY_MD[states[index]]
        let rslt = stats[index][k] 
        resolve_outer(p,rslt);
        return;
    } else {
    }
}

function any_settled(p,index,...cu_params) {engine_of_any_settled(p,index,undefined,undefined,'resolved-or-rejected')}


function engine_of_at_least_some_settled(p,index,n_or_certain,cf,cond_state) {
    let stats = p.$stats
    let states = stats.map(r=>r.state)
    if(n_or_certain > states.length) {
        let rejected = new Error(`total-task-count-is-${states.length}:but-require-${n_or_certain}-to-be-settled`);
        let exception = rejected;
        reject_outer(p,exception);
        return;
    } else {}
    let cond = cf(n_or_certain,...stats.map(r=>r.state!=='pending'))
    if(cond) {
        let cond = cf(n_or_certain,...stats.map(r=>r.state!=='pending'))
        let resolved = stats.filter(r=>r.state !== 'pending');
        let rslt = resolved.map(
            (r,i)=> {
                let k = STATE_KEY_MD[r.state]
                return(r[k])
            }
        );
        resolve_outer(p,rslt);
        return;
    } else {
    }
}

function at_least_some_settled(p,index,...cu_params) {
    let n_or_certain = cu_params[0];
    engine_of_at_least_some_settled(p,index,n_or_certain,nao.at_least_some,'resolved-or-rejected')
}

function engine_of_at_least_certain_settled(p,index,n_or_certain,cf,cond_state) {
    let stats = p.$stats
    let states = stats.map(r=>r.state)
    if(n_or_certain > states.length) {
        let rejected = new Error(`total-task-count-is-${states.length}:but-require-${n_or_certain}-to-be-settled`);
        let exception = rejected;
        reject_outer(p,exception);
        return;
    } else {}
    ////
    let in_range = check_certain_indexes_in_range(states,n_or_certain);
    if(in_range) {} else {
        let rejected = new Error(`total-task-count-is-${states.length}:but-require-at-least-${n_or_certain}-to-be-${cond_state}`);
        let exception = rejected;
        reject_outer(p,exception);
        return;
    }
    ////
    let cond = cf(n_or_certain,...stats.map(r=>r.state!=='pending'))
    if(cond) {
        let cond = cf(n_or_certain,...stats.map(r=>r.state!=='pending'))
        let resolved = stats.filter((r,i)=>(r.state !== 'pending') && n_or_certain.includes(i));
        let rslt = resolved.map(
            (r,i)=> {
                let k = STATE_KEY_MD[r.state]
                return(r[k])
            }
        );
        resolve_outer(p,rslt);
        return;
    } else {
    }
}

function at_least_certain_settled(p,index,...cu_params) {
    let n_or_certain = cu_params;
    engine_of_at_least_certain_settled(p,index,n_or_certain,nao.at_least_certain,'resolved-or-rejected')
}



let STR_CONDS = {
    all,
    all_not,
    any,
    any_not,
    at_least_some,
    at_least_some_not,
    must_some,
    must_some_not,
    one,
    one_not,
    at_least_certain,
    at_least_certain_not,
    must_certain,
    must_certain_not,
    all_settled,
    any_settled,
    at_least_some_settled,
    at_least_certain_settled,
}

function is_supported_str_cond(o) {
    let cond  =  (typeof(o) ==='string')
    return(cond && Object.keys(STR_CONDS).includes(o))
}

function handler(p,i,cond_or_func,...cu_params) {
     if(p.state === "pending"){
         if(is_supported_str_cond(cond_or_func)) {
             STR_CONDS[cond_or_func](p,i,...cu_params)
         } else if(is_function(cond_or_func)) {
             cond_or_func(p,i,...cu_params)
         } else {
             throw(new Error(`
the supported str-condition is in ${Object.keys(STR_CONDS)};
you cant use a customer defined function wrap(funcs,params,<your function>);
or  use add_str_cond(name,<you function>) to add the str-condition;
`))
         }
     }
}

function add_str_cond(name,f) {
    STR_CONDS[name] = f,
    module.exports[name] = dflt_str_cond_wrap(name);
}

function wrap(funcs,params,cond_or_func) {
    function f(...cu_params) {
        let $stats = funcs.map((r,i)=>({state:'pending',rslt:undefined,exception:undefined,index:i,arguments:params,func:r}))
        let $resolve = undefined;
        let $reject = undefined;
        let p = new Promise((rs,rj) => {$resolve=rs;$reject=rj})
        ////the internal stats of each task
        p.$stats = $stats
        p.$resolve = $resolve 
        p.$reject = $reject
        Object.defineProperty(p,'$stats',{enumerable:false,configurable:false})
        Object.defineProperty(p,'$resolve',{enumerable:false,configurable:false})
        Object.defineProperty(p,'$reject',{enumerable:false,configurable:false})
        ////the outter based on condition
        p.state = 'pending'  //pending resolved rejected
        p.exception = undefined
        p.rslt = undefined
        Object.defineProperty(p,'state',{enumerable:false,configurable:false})
        Object.defineProperty(p,'exception',{enumerable:false,configurable:false})
        Object.defineProperty(p,'rslt',{enumerable:false,configurable:false})        
        ////
        //p 的条件
        p.condition = is_function(cond_or_func)? cond_or_func.toString(): cond_or_func;
        p.condition = p.condition + ((cu_params.length>0)?'\n arguments: '+cu_params.toString():'')
        ////额外的错误信息
        p.extra_err_msg = undefined 
        ////
        for(let i=0;i<funcs.length;i++) {
            let tp = funcs[i](...params[i])
            tp.then(
                r=> {
                    p.$stats[i].rslt = r;
                    p.$stats[i].state = 'resolved';
                    handler(p,i,cond_or_func,...cu_params);
                }
            ).catch(
                err=> {
                    p.$stats[i].exception = err;
                    p.$stats[i].state = 'rejected';
                    handler(p,i,cond_or_func,...cu_params);
                }
            )
        }
        return(p)
    }
    return(f)
}


function dflt_str_cond_wrap(cond_str) {
    let f = function (funcs,params) {
        return(wrap(funcs,params,cond_str))
    }
    f.name = cond_str;
    return(f)
}

module.exports = {
    STATES,
    STATE_KEY_MD,
    get_anti_key_with_cond_state,
    get_anti_state,
    resolve_outer,
    reject_outer,
    add_str_cond,
    wrap,
    //
    //
    all:dflt_str_cond_wrap('all'),
    all_not:dflt_str_cond_wrap('all_not'),
    any:dflt_str_cond_wrap('any'),
    any_not:dflt_str_cond_wrap('any_not'),
    at_least_some:dflt_str_cond_wrap('at_least_some'),
    at_least_some_not:dflt_str_cond_wrap('at_least_some_not'),
    must_some:dflt_str_cond_wrap('must_some'),
    must_some_not:dflt_str_cond_wrap('must_some_not'),
    one:dflt_str_cond_wrap('one'),
    one_not:dflt_str_cond_wrap('one_not'),
    at_least_certain:dflt_str_cond_wrap('at_least_certain'),
    at_least_certain_not:dflt_str_cond_wrap('at_least_certain_not'),
    must_certain:dflt_str_cond_wrap('must_certain'),
    must_certain_not:dflt_str_cond_wrap('must_certain_not'),
    all_settled:dflt_str_cond_wrap('all_settled'),
    any_settled:dflt_str_cond_wrap('any_settled'),
    at_least_some_settled:dflt_str_cond_wrap('at_least_some_settled'),
    at_least_certain_settled:dflt_str_cond_wrap('at_least_certain_settled'),
}
