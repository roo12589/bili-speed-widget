import './App.css'

function App() {
    initStorage()

    /* 监听history改变 防止视频换p导致倍速丢失 */
    const bindHistoryEvent = function (type) {
        const historyEvent = history[type]
        return function () {
            const newEvent = historyEvent.apply(this, arguments) //执行history函数
            const e: any = new Event(type) //声明自定义事件
            e.arguments = arguments
            window.dispatchEvent(e) //抛出事件
            return newEvent //返回方法，用于重写history的方法
        }
    }
    history.pushState = bindHistoryEvent('pushState')
    history.replaceState = bindHistoryEvent('replaceState')
    //  window.addEventListener('replaceState', function(e) {
    //    console.log('THEY DID IT AGAIN! replaceState');
    //  });
    window.addEventListener('pushState', () => {
        resetVideoSpeed()
    })
    // 倍速列表 暂仅支持localStorage修改
    const videoSpeedListTop = localStorage.getItem('bsw-speed-list-top')?.split(',').map(parseFloat) || [1, 2, 3]
    const videoSpeedListBottom = localStorage.getItem('bsw-speed-list-bottom')?.split(',').map(parseFloat) || [
        1.2, 1.3, 1.5, 1.8, 2.3, 2.5,
    ]

    // 全局保存速度备份
    var videoSpeedBack
    var isOpen = true
    const nameWhiteList = localStorage.getItem('bsw-nameWhiteList')?.split(',') || []
    const username = document.querySelector<HTMLElement>('.up-info_right .username')?.innerText
    const usernameCombined = new Array()
        .concat(document.querySelectorAll<HTMLElement>('.up-card .name-text'))
        .map((el) => el.innerText)
        .toString()
    for (const name of nameWhiteList) {
        if (username?.match(name) || usernameCombined?.match(name)) {
            isOpen = false
            break
        }
    }

    // 按键播放速度控制
    document.onkeydown = function (e) {
        // console.log(e)
        if ((e.target as HTMLInputElement).type === 'text' || (e.target as HTMLInputElement).type === 'textarea') return
        let speed = getSpeed() || 1.0
        // const playerSpeedButton = document.querySelector<HTMLElement>('.bilibili-player-video-btn-speed-name')

        let ev = e || window.event // for IE to cover IEs window event-object

        // z切换开关倍速 和点击currentSpeedBtn一样
        if (ev.key === 'z') {
            if (isOpen) {
                isOpen = false
                videoSpeedBack = getSpeed()
                changeVideoSpeed(1, false)
            } else {
                isOpen = true
                changeVideoSpeed(videoSpeedBack)
                videoSpeedBack = undefined
            }
        }
        if (ev.key === 'c') {
            changeVideoSpeed((speed * 10 + 1) / 10)
            return false
        } else if (ev.key === 'x') {
            changeVideoSpeed((speed * 10 - 1) / 10)
            return false
        }
    }

    window.onload = function () {
        resetVideoSpeed()
    }

    /**
     *
     * @param {number} x speed
     * @param {boolean} save 是否保存到local
     * @returns
     */
    function changeVideoSpeed(x, save = true) {
        const min = 0.1,
            max = 16.0
        if (x > max || x < min) return
        // bibibili播放器内置速度显示
        const playerSpeedButton = document.querySelector<HTMLElement>('.bilibili-player-video-btn-speed-name')
        let speed
        if (typeof x == 'number') {
            speed = x
        } else if (typeof x == 'string') {
            speed = parseFloat(x)
        } else {
            speed = parseFloat(x.target.innerHTML.replace('x', ''))
        }
        if (save) {
            localStorage.setItem('bsw-current-speed', speed)
        }
        document.querySelector<HTMLElement>('#current-speed-btn')!.innerHTML = save ? 'x' + speed : '关闭'
        let videoObj = document.querySelector('video')
        if (!videoObj) videoObj = document.querySelector('bwp-video')
        if (videoObj) {
            videoObj.playbackRate = speed
            console.log(videoObj.playbackRate)
            playerSpeedButton && (playerSpeedButton.innerText = save ? speed + 'x' : '关闭')
        }
        createNoti(save ? getSpeed().toFixed(1) : '关闭')
    }

    function resetVideoSpeed() {
        let count = 0
        const timer = setInterval(() => {
            let videoObj = document.querySelector('video') || document.querySelector('bwp-video')
            console.log('等待加载播放器...')
            if (videoObj) {
                if (isOpen) {
                    videoObj.playbackRate = getSpeed()
                } else {
                    videoSpeedBack = getSpeed()
                    changeVideoSpeed(1, false)
                }
                console.log('已加载', videoObj.playbackRate)
                coverTitle()
                clearInterval(timer)
            }
            count++
            if (count >= 10) {
                clearInterval(timer)
                createNoti('获取播放器组件超时')
            }
        }, 1000)
    }
    let timer
    function createNoti(message: string) {
        if (timer) clearTimeout(timer)
        if (!window.pluginNotification) {
            let div = document.createElement('div')
            div.className = 'plugin-notification'
            window.pluginNotification = div
            div.appendChild(document.createTextNode(message))
            //document.body.appendChild(div)
            const ele =
                document.querySelector('.bpx-player-video-wrap') ||
                document.querySelector('#playerWrap') ||
                document.body
            ele && ele.appendChild(div)
        } else {
            window.pluginNotification.className = 'plugin-notification show'
            window.pluginNotification.innerText = message
        }
        timer = setTimeout(function () {
            window.pluginNotification.className = 'plugin-notification'
        }, 1300)
    }

    function coverTitle() {
        // 修改视频标题为当前正在播放p名称
        let OnP = document.querySelector('.list-box>.on>a')
        let Title: any = document.querySelector('.video-info .video-title .tit')
        if (OnP && OnP.getAttribute('title')) {
            let OnPName = OnP.getAttribute('title')
            let docTitle: any = document.querySelector('head>title')
            docTitle.innerHTML = OnPName
            Title.innerHTML = OnPName
        }
        let progresses = document.querySelectorAll<HTMLElement>('.bui-bar-wrap>.bui-bar-normal')
        progresses.forEach((ele) => (ele.style.background = '#FFAFC9'))
    }

    function getSpeed() {
        return parseFloat(parseFloat(localStorage.getItem('bsw-current-speed') || '1').toFixed(1))
    }
    function initStorage() {
        if (!localStorage.getItem('bsw-name-white-list')) {
            localStorage.setItem('bsw-name-white-list', ['戒社', '罗翔'].toString())
        }
    }

    // let _interval = setInterval(function () {
    //     if (document.querySelector('.bb-comment') && document.getElementById('bili-speed-app') === null) {
    //         InjectApp()
    //     }
    // }, 100)

    // 挂载到currentSpeedBtn上的方法
    // 鼠标切换开关倍速
    const switchStatus = () => {
        if (isOpen) {
            isOpen = false
            videoSpeedBack = getSpeed()
            changeVideoSpeed(1, false)
        } else {
            isOpen = true
            changeVideoSpeed(videoSpeedBack)
            videoSpeedBack = undefined
        }
    }
    // 滚轮上下加减倍速
    const changeSpeedByMouse = (e: WheelEvent) => {
        let speed = getSpeed()
        const playerSpeedButton = document.querySelector<HTMLElement>('.bilibili-player-video-btn-speed-name')
        //补全滚轮事件
        e.preventDefault() //通知浏览器不执行默认的动作
        if (e.deltaY) {
            //IE/Opera/Chrome
            if (e.deltaY > 0) {
                //下
                playerSpeedButton && (playerSpeedButton.innerText = speed + 'x')
                changeVideoSpeed((speed * 10 - 1) / 10)
            } else {
                //上
                playerSpeedButton && (playerSpeedButton.innerText = speed + 'x')
                changeVideoSpeed((speed * 10 + 1) / 10)
            }
        }
    }

    let currentSpeedBtn = (
        <button
            id="current-speed-btn"
            onClick={switchStatus}
            ref={(el) => {
                if (el) {
                    el.addEventListener(
                        'wheel',
                        (e) => {
                            changeSpeedByMouse(e)
                        },
                        { passive: false }
                    )
                }
            }}
        >
            {'x' + getSpeed()}
        </button>
    )

    let videoTop = (
        <div className="video-speed-box" id="video-speed-box-top">
            <div> {currentSpeedBtn} </div>
            {videoSpeedListTop.map((speed) => (
                <button id={'btn-' + speed} key={'btn-' + speed} style={{ width: '40px' }} onClick={changeVideoSpeed}>
                    {'x' + speed}
                </button>
            ))}
        </div>
    )
    let videoBottom = (
        <div className="video-speed-box" id="video-speed-box-bottom">
            {videoSpeedListBottom.map((speed) => (
                <button id={'btn-' + speed} key={'btn-' + speed} style={{ width: '40px' }} onClick={changeVideoSpeed}>
                    {'x' + speed}
                </button>
            ))}
        </div>
    )
    const app = (
        <div
            id="bili-speed-app"
            style={{
                position: 'relative',
                top: '-13.5px',
                right: 0,
                width: '1000px',
            }}
        >
            {videoTop}
            {videoBottom}
        </div>
    )

    return app

    // setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
}

export default App
