// IdeaSoft Live Sales

(() => {
    // CONFIGIRATIONS
    const SHIFT_TIME = 3000
    const BREATH_TIME = 200
    const SALES_COUNT= 6942163;

    const API_URL = 'https://canli.ideasoft.com.tr/api/v1/live/export.php';

    var PRODUCT_DETAIL_TEMPLATE = '<div class="sale-detail"><div class="image"><img src="{{ image }}" alt="{{ name }}" /></div><div class="detail"><div class="location"><p>{{ city }}</p></div><div class="product-name"><p>{{ name }}</p></div><div class="product-price">{{ price }}</div></div></div>'

    const setCookie = (cname, cvalue, exminutes) => {
        let d = new Date();
        d.setTime(d.getTime() + (exminutes*60*1000));
        let expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    const getCookie = (cname) => {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i <ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    const refreshDate = () => {
        let today = new Date();
        let date = [
            today.getDate() < 10 ? '0' + today.getDate() : today.getDate(),
            (today.getMonth() + 1)  < 10 ? '0' + (today.getMonth() + 1) : (today.getMonth() + 1),
            today.getFullYear()
        ];
        let time = [
            today.getHours() < 10 ? '0' + today.getHours() : today.getHours(),
            today.getMinutes() < 10 ? '0' + today.getMinutes() : today.getMinutes()
        ];
        $('.bar.date').text(date.join('.'))
        $('.bar.hour').text(time.join(':'))
    }
    const trigerCounter = () =>{
        $('.counter').each(function() {
            $(this).text($(this).text().replace('.',''));
            var $this = $(this),
                countTo = $this.attr('data-count');
            $({ countNum: parseInt($this.text().replace('.',''))}).animate({
                    countNum: countTo
                },
                {
                    duration: 1000,
                    easing:'linear',
                    step: function() {
                        $this.text(Math.floor(this.countNum).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."))
                    },
                    complete: function() {
                        $this.text(this.countNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."))
                    }
                });
        });
    }
    const triggerSales = () => {
        setTimeout(function(){fetchLiveSales() }, 5000);
    }
    const fetchLiveSales = (refreshed=false) => {
        refreshDate();
		const proxyurl = "https://cors-anywhere.herokuapp.com/";
        fetch(proxyurl + API_URL+ '?refreshed=' + refreshed ).then(function (result) {
            if(result.headers.get('Content-Length') > 0){
                return result.json()
            }else{
                let err = new Error(result.statusText)
                err.response = result
                throw err
            }
        }).catch(error => {
            triggerSales();
        }).then(function (res) {
                if(!res){
                    return;
                }
                const totalSales = parseInt(res.total_sales_count);
                $('.bar-count.sales').attr('data-count',totalSales);
                const latestSales = res.sales.reverse()
                const saleCount = res.sales.length;
                if(saleCount == 0){
                    triggerSales();
                }
                let currentCount = 0
                latestSales.forEach((saleInfo, index) => {
                    new Image().src = saleInfo.image;
                    setTimeout(() => {
                        refreshDate();
                        if(saleInfo.city == 'Ä°stanbul-Anadolu' || saleInfo.city == 'Ä°stanbul-Avrupa'){
                            saleInfo.city = 'Ä°stanbul';
                        }
                        $('[data-iladi="' + saleInfo.city + '"] path').addClass('active')
						
						var PRODUCT_DETAIL_TEMPLATE2 = PRODUCT_DETAIL_TEMPLATE.replace("{{ image }}","http://"+ saleInfo.image)
                        const html = Mustache.to_html(PRODUCT_DETAIL_TEMPLATE2, saleInfo);
                        $('.active:first-child').popover('dispose');
                        $('.active:first-child').popover({container:'#container', trigger: 'manual', placement: 'top', content: html, html: true})
                        $('.active').popover('show')
                        var p=$('.product-name p');
                        var divh=$('.product-name').height();
                        while ($(p).outerHeight()>divh) {
                            $(p).text(function (index, text) {
                                return text.replace(/\W*\s(\S)*$/, '...');
                            });
                        }
                        setCookie('last_shown_id',saleInfo.id,60*24);
                        setCookie('total_sales_count',totalSales,15);
                        setTimeout(() => {
                            currentCount++
                            $('.active').popover('hide')
                            $('.active').removeClass('active')
                            // This set timeout is important, otherwise you'll get stackoverflow: thanks to event loop :)
                            if (currentCount == saleCount){
                                setTimeout(fetchLiveSales(), 0)
                            }
                        }, SHIFT_TIME - BREATH_TIME)
                    }, SHIFT_TIME * index)
                });
                trigerCounter();
            })
    }

    $(document).ready(() => {
        fetchLiveSales(true);
        $('.bar .indicator').text('');
        $('.bar .indicator').after('<span>CANLI</span>');
        let today = new Date();
        $('#sales_date').html(today.getFullYear());
        if(getCookie('total_sales_count')){
            totalSales = getCookie('total_sales_count');
        }
        $('.bar-count.sales').text(totalSales);
    })
})()