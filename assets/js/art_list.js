$(function () {
    var layer = layui.layer
    var form = layui.form
    var laypage = layui.laypage


    // 美化时间的过滤器
    template.defaults.imports.dataFormat = function (date) {
        const dt = new Date(date)
        var y = dt.getFullYear()
        var m = (dt.getMonth() + 1).toString().padStart(2, 0)
        var d = dt.getDate().toString().padStart(2, 0)

        var hh = dt.getHours().toString().padStart(2, 0)
        var mm = dt.getMinutes().toString().padStart(2, 0)
        var ss = dt.getSeconds().toString().padStart(2, 0)
        return `${y}-${m}-${d} ${hh}:${mm}:${ss}`

    }
    // 定义一个参数对象
    var q = {
        // 页码值,默认请求第一页的数据
        pagenum: 1,
        // 每页显示几条数据,默认每页显示2条数据
        pagesize: 2,
        cate_id: '', // 文章分类的 Id
        state: '' // 文章的发布状态
    }
    initTable()
    initCate()




    //  获取文章列表数据
    function initTable() {
        $.ajax({
            method: 'GET',
            url: '/my/article/list',
            data: q,
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('获取文章列表失败!')
                }
                // 使用模板引擎渲染页面的数据
                var htmlStar = template('tpl-table', res)
                $('tbody').html(htmlStar)
                renderPage(res.total)

            }
        })
    }
    // 初始化文章分类
    function initCate() {
        $.ajax({
            method: "GET",
            url: '/my/article/cates',
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('获取分类数据失败!')
                }
                // 调用模板引擎渲染分类的可选项
                var htmlStr = template('tpl-cate', res)
                $('[name=cate_id]').html(htmlStr)
                // 通过layui 重新渲染表单区域区域的ui结构
                form.render()
            }
        })
    }

    // 筛选功能
    $('#form-search').on('submit', function (e) {
        e.preventDefault()
        // 获取表单中选中项 的值
        var cate_id = $('[name=cate_id]').val()
        var state = $('[name=state]').val()
        q.cate_id = cate_id
        q.state = state
        // 根据最新的筛选条件,重新渲染表格的数据
        initTable()
    })

    // 渲染分页的功能
    function renderPage(total) {
        // 调用laypage.render()方法俩渲染分页的结构
        laypage.render({
            elem: "pageBox",// 分页容器的ID
            count: total,// 总数据条数
            limit: q.pagesize,//每页显示几条数据
            curr: q.pagenum, //设置默认被选中的分页
            layout: ['count', 'limit', 'prev', 'page', 'next', 'skip'],
            limits: [2, 3, 5, 10],
            // 分页切换的时候,触发jump回调
            jump: function (obj, first) {
                // console.log(obj.curr);
                // 把最新的页码值,赋值到q这个查询参数对象中
                q.pagenum = obj.curr
                //把最新的条目数,赋值到q这个查询对象的pagesize属性中
                q.pagesize = obj.limit
                // 根据最新的q获取对应的数据列表,并渲染表格
                if (!first) {
                    initTable()
                }
            }
        })
    }

    // 删除文章功能
    $('tbody').on('click', '.btn-delete', function () {
        // 获取删除按钮的个数
        var len = $('.btn-delete').length
        // 获取文章的ID
        var id = $(this).attr('data-id')
        // 询问用户是否删除数据
        layer.confirm('确认删除?', { icon: 3, title: '提示' }, function (index) {
            $.ajax({
                method: 'GET',
                url: '/my/article/delete/' + id,
                success: function (res) {
                    if (res.status !== 0) {
                        return layer.msg('删除文章失败!')
                    }
                    layer.msg('删除文章成功!')
                    // 当数据删除完成后,需要判断当前这一页中,是否还有剩余的数据
                    // 如果没有剩余的数据了，则让页码值减-1之后，
                    // 在重新调用initTable方法
                    if (len === 1) {
                        // 如果len的值等于1,证明删除完毕之后,页面上就没有任何数据了\
                        // 页码值最小必须是1
                        q.pagenum = q.pagenum === 1 ? 1 : q.pagenum - 1
                    }
                    initTable()
                }
            })
            // 关闭当前弹出层
            layer.close(index)

        })

    })




})