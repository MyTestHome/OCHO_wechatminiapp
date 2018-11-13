//index.js
//获取应用实例
const app = getApp()

let queryStr = ''
var timer; 
var array = [];
var medialiststr;
var eventname;
var videocount = 0;
//var errVideolist = [];
var that;
var downloadsuccesscount = 0;
var showtoastcount = 0;
Page({
  data: {
    mediaList: [],
    logo: '',
    tabTitle: '',
    textUpper: '',
    textAbovePhoto: '',
    textUnderPhoto: '',
    textBottom: '',
    textColor: null,
    backgroundColor: null,
    backgroundImage: null,
    backgroundImageToggle: false,
    cloudinaryDirectory: '',
    qrCodeImage: '',
    icon: null,
    title: '',
    description: '',
    show: 1,
    showTitle: 1,
    showText: 1,
    showTextUnder: 1,
    showqr: 1,
    linkstr: '',
    textabovePhoto_end: '',
    linkurl: '',
    linkstr_bottom: '',
    textBottom_end: '',
    linkurl_bottom: '',
    showeventlink: 1,
    showindexview: 1
},

// onReady: function (res) {
//   that.videoContext = wx.createVideoContext('myVideo')
// },
 onLoad: function (options) {
   that = this;
  //  console.log('options:' +options);
   if (options.query != null)
   {
      that.setData({
        showeventlink: 0,
        showindexview: 1
      })
      let pararr= options.query.split(',');
      queryStr = options.query;

      // for tests
      // let testdata = 'DevelopTEST,L4JPU,5badaeed9667d04ce1bf1782'; //Longine,EDWPS，5baf19839667d04ce1bf1783   //  support 4 videos

  //  let testdata = 'DevelopTEST/OCHO_73QVD.mp4,5badaeed9667d04ce1bf1782'
  //    let pararr = testdata.split(',');
  //    queryStr = testdata;

      medialiststr = pararr[0].split('-');
      videocount = medialiststr.length;
      //errVideolist = medialiststr;
      //eventname = pararr[0];
      eventname = medialiststr[0].split('/')[0];
   
      console.log('queryStr:' + queryStr);
      console.log('mediaList:' + this.data.mediaList);
      
      let serviceurl = 'https://services.rcn8.cn/api/event/getEventShareById/' + pararr[1];
    
      let token =   'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE0ODY3MzE5MzgsImV4cCI6MTUxODI2NzkzOCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoidGVzdDYifQ.X8l82QUd7sXLuqNxiTJaQZDhU9V7_4fIi3MKNxYHOQU';
      
      wx.showShareMenu({
        withShareTicket: true
      })

      //get request , get event share config
      that.setEventShareData(serviceurl, token);

      array = [];
      downloadsuccesscount = 0;
      showtoastcount = 0;

      // load video
      //that.setloadvideo();

      that.setdownloadvideo(eventname);

   }
   else{
     // show default pic and link
     that.setData({
       showeventlink: 1,
       showindexview: 0
     })
   }
},
setloadvideo: function (){

  for (var index in medialiststr) {
    //let medianame = eventname +'/OCHO_' + medialiststr[index] + '.mp4';
    let medianame = medialiststr[index];
    let mediaurl = 'https://media.rcn8.cn/' + medianame;
    var obj = {};
    obj.mediaurl = mediaurl;
    array.push(obj);
  }
  that.setData({
    mediaList: array
  })
}, 

setdownloadvideo: function () {
    for (var index in medialiststr) {
      //let medianame = eventname + '/OCHO_' + medialiststr[index] + '.mp4';
      let medianame = medialiststr[index];
      let mediaurl = 'https://media.rcn8.cn/' + medianame;
      //console.log('mediaurl:' + mediaurl);
      // down video , if video not upload, show default
      that.downandshowvideo(mediaurl, index);
    }
  }, 

downandshowvideo: function (mediaurl, index) {
  console.log('downloadFile:' + mediaurl)
  wx.downloadFile({
    url: mediaurl,
    type: 'video',
    success: function (res) {
      var obj = {};
      if (res.statusCode == 200) {
        console.log('res:'+res);
         let path = res.tempFilePath;
        //  wx.getFileInfo({
        //   filePath: path,
        //   success: function(res) {
        //     console.log("file size:" + res.size);
        //     console.log(res.digest);
        //   }
        //})
        // obj.mediaurl = path;
        // arraydownload.push(obj);
        downloadsuccesscount = downloadsuccesscount + 1;
        if (downloadsuccesscount == videocount){
         
          that.setData({
            mediaList: null
          })
          array = [];
          downloadsuccesscount = 0;
          showtoastcount = 0;
          that.setloadvideo();

          //clearInterval(timer);
          wx.hideToast();
          console.log("----finished----");
        }
      }
      else {
        showtoastcount = showtoastcount + 1;
        if (showtoastcount == 1) // one time
        {
          console.log("----coming----");
          wx.showToast({
            title: '视频加载中...',
            icon: 'loading',
            //mask: true,
            duration: 1000*60*10  //10minutes
          })
          that.setloadvideo();

        }
        that.downandshowvideo(mediaurl, index);
      }
  
    },
    fail:function(res){
      console.log('res:' + res);
      showtoastcount = showtoastcount + 1;
      if (showtoastcount == 1) // one time
      {
        console.log("----coming----");
        wx.showToast({
          title: '视频加载中...',
          icon: 'loading',
          //mask: true,
          duration: 1000 * 60 * 10  //10minutes
        })
        that.downandshowvideo(mediaurl, index);
      }
    }
  })
},
setreloadtimer: function () {
  that.setdownloadvideo();
},
setEventShareData: function (serviceurl, token) {
  wx.request({
    url: serviceurl,
    header: {
      'token': token
    },
    success: function (res) {
      var eventText = res.data.eventText;
      var wechatShare = res.data.wechatShare;
      var texta = '';
      if (eventText.textAbovePhoto != '' && eventText.textAbovePhoto != null) 
      {
        texta = eventText.textAbovePhoto.replace(/<br>/g, '\n')
      }

      var textu = '';
      if (eventText.textUnderPhoto != '' && eventText.textUnderPhoto != null) {
        textu = eventText.textUnderPhoto.replace(/<br>/g, '\n')
      }
      var textb = '';
      if (eventText.textBottom != '' && eventText.textBottom != null) {
        textb = eventText.textBottom.replace(/<br>/g, '\n')
      }
      var reTitle = 'null';
      if (eventText.tabTitle != '' && eventText.tabTitle != null)
        reTitle = eventText.tabTitle;

      var textup ='';
      if (eventText.textUpper != '' && eventText.textUpper != null)
        textup = eventText.textUpper;

      that.setData({
        logo: eventText.logo,
        tabTitle: reTitle,
        textUpper: textup,
        textAbovePhoto: texta,
        textUnderPhoto: textu,
        textBottom: textb,
        textColor: eventText.textColor,
        backgroundColor: eventText.backgroundColor,
        backgroundImage: eventText.backgroundImage,
        backgroundImageToggle: eventText.backgroundImageToggle,
        cloudinaryDirectory: eventText.cloudinaryDirectory,
        qrCodeImage: eventText.qrCodeImage,

        // wechat share content
        icon: wechatShare.icon,
        title: wechatShare.title,
        description: wechatShare.description
      })
      console.log('textAbovePhoto:' + that.data.textAbovePhoto);

      //Generate Link 
      if (eventText.textAbovePhoto != '' && eventText.textAbovePhoto != null && eventText.textAbovePhoto.indexOf('<a') >= 0) {
        let startindex = eventText.textAbovePhoto.indexOf('<a');
        let endindex = eventText.textAbovePhoto.indexOf('</a>');
        let textAbovePhoto_str = eventText.textAbovePhoto.substring(0, startindex);
        let link = eventText.textAbovePhoto.substring(startindex, endindex + 4);
        let textabovePhoto_end = eventText.textAbovePhoto.substring(endindex + 4);

        let href = link.substring(link.indexOf('"') + 1, link.lastIndexOf('"'));
        let linktext = link.substring(link.indexOf('>') + 1, link.indexOf('</a>'));

        that.setData({
          textAbovePhoto: textAbovePhoto_str.replace(/<br>/g, '\n'),
          linkstr: linktext,
          textabovePhoto_end: textabovePhoto_end.replace(/<br>/g, '\n'),
          linkurl: href
        })

        console.log('textAbovePhoto:' + that.data.textAbovePhoto);
      }

      //bottom Generate Link
      if (eventText.textBottom != '' && eventText.textBottom != null && eventText.textBottom.indexOf('<a') >= 0) {
        let startindex = eventText.textBottom.indexOf('<a');
        let endindex = eventText.textBottom.indexOf('</a>');
        let textBottom_str = eventText.textBottom.substring(0, startindex);
        let link = eventText.textBottom.substring(startindex, endindex + 4);
        let textBottom_end = eventText.textBottom.substring(endindex + 4);

        let href = link.substring(link.indexOf('"') + 1, link.lastIndexOf('"'));
        let linktext = link.substring(link.indexOf('>') + 1, link.indexOf('</a>'));

        that.setData({
          textBottom: textBottom_str.replace(/<br>/g, '\n'),
          linkstr_bottom: linktext,
          textBottom_end: textBottom_end.replace(/<br>/g, '\n'),
          linkurl_bottom: href
        })
      }

      // nimiapp title
      wx.setNavigationBarTitle({
        title: that.data.tabTitle
      })

      // show style
      if (that.data.logo == null) {
        that.setData({
          show: 0
        })
       // console.log('show:' + that.data.show)
      }
      if (that.data.textUpper == "") {
        that.setData({
          showTitle: 0
        })
      }
      if (that.data.textAbovePhoto == "") {
        that.setData({
          showText: 0
        })
      }
      if (that.data.textUnderPhoto == "") {
        that.setData({
          showTextUnder: 0
        })
      }
      if (that.data.qrCodeImage == null) {
        that.setData({
          showqr: 0
        })
      }
     // console.log("======:" + JSON.stringify(res.data));
    }
  })
},
// onShow(e) {
// 　　wx.showShareMenu({
// 　　withShareTicket: true
// 　　})
// },
videoErrorCallback: function(e) {
  console.log('video err msg:');
  console.log( e.detail.errMsg);
},
onShareAppMessage: function (res) {
    return {
      title: that.data.title,
      path: '/pages/index/index?query=' + queryStr,
      imageUrl: that.data.icon
    }
},
saveVideoToPhotosAlbum:function(event){
  wx.downloadFile({
    url: event.currentTarget.dataset.src, 
    success: function (res) {
        wx.saveVideoToPhotosAlbum({
          filePath: res.tempFilePath,
          success(res) {
            wx.showToast({
              title: '已保存到系统相册',
              icon: 'success',
              duration: 2000
            });  
            console.log(res.errMsg);
        }
      })
    }
  })
  },

 previewImage: function (e) {
    wx.previewImage({
      current: that.data.qrCodeImage, // 当前显示图片的http链接   
      urls: [that.data.qrCodeImage] // 需要预览的图片http链接列表   
    })
  },

  goWebUrl: function () {
    wx.navigateTo({
      url: '../out/out?query=' + that.data.linkurl, 
      success: function () {

      },       
      fail: function () { },         
      complete: function () { }      
    })
  },

  goWebUrl_bottom: function () {
    wx.navigateTo({
      url: '../out/out?query=' + that.data.linkurl_bottom,
      success: function () {

      },
      fail: function () { },
      complete: function () { }
    })
  },
  goWebUrl_eventlink: function () {
    wx.navigateTo({
      url: '../out/out?query=' + 'https://mp.weixin.qq.com/',
      success: function () {

      },
      fail: function () { },
      complete: function () { }
    })
  },
  // save: function () {
  //   var that = that;
  //   //获取相册授权
  //   wx.getSetting({
  //     success(res) {
  //       if (!res.authSetting['scope.writePhotosAlbum']) {
  //         wx.authorize({
  //           scope: 'scope.writePhotosAlbum',
  //           success() {//这里是用户同意授权后的回调
  //             that.saveVideoToPhotosAlbum();
  //           },
  //           fail() {//这里是用户拒绝授权后的回调
  //             that.setData({
  //               saveImgBtnHidden: true,
  //               openSettingBtnHidden: false
  //             })
  //           }
  //         })
  //       } else {//用户已经授权过了
  //         that.saveVideoToPhotosAlbum();
  //       }
  //     }
  //   })
  // },

  // handleSetting: function (e) {
  //   let that = that;
  //   // 对用户的设置进行判断，如果没有授权，即使用户返回到保存页面，显示的也是“去授权”按钮；同意授权之后才显示保存按钮
  //   if (!e.detail.authSetting['scope.writePhotosAlbum']) {
  //     wx.showModal({
  //       title: '警告',
  //       content: '若不打开授权，则无法将图片保存在相册中！',
  //       showCancel: false
  //     })
  //     that.setData({
  //       saveImgBtnHidden: true,
  //       openSettingBtnHidden: false
  //     })
  //   } else {
  //     wx.showModal({
  //       title: '提示',
  //       content: '您已授权，赶紧将图片保存在相册中吧！',
  //       showCancel: false
  //     })
  //     that.setData({
  //       saveImgBtnHidden: false,
  //       openSettingBtnHidden: true
  //     })
  //   }
  // }

  // previewImage: function (e) {
  //   wx.previewImage({
  //     urls: that.data.src.split(',')
  //     // 需要预览的图片http链接  使用split把字符串转数组。不然会报错
  //   })
  // },

  previewImage: function (e) {
    wx.previewImage({
      current: this.data.imgalist, // 当前显示图片的http链接   
      urls: this.data.imgalist // 需要预览的图片http链接列表   
    })
}

})

