// forked ported and forked from nutsu's http://wonderfl.net/c/9os2
// forked from PESakaTFM's "Worms" http://jsdo.it/PESakaTFM/worms

window.math = (function(){

  this.random = function(min,max){
    return Math.random()*(max-min) + min
  }

  this.dist = function(x1,y1,x2,y2){
    return Math.sqrt(
                    Math.pow(x1 - x2,2) +
                    Math.pow(y1 - y2,2)
                    )
  }
  return this
  
})()

var width = window.innerWidth
  , height = window.innerHeight
  , canvas
  , context
  , vms = []
  , MAX_NUM = 100
  , N = 80
  , col = 255
  , frameRate = 60
  , width
  , height
  , p
  , px = 0
  , py = 0
  , rgb = {r:0,g:0,b:0}
  , col = 0
  , cur = 2/3
  , mouseX = 0
  , mouseY = 0
  , interval
  , prevTouch

function restart(){
  width = window.innerWidth
  height = window.innerHeight
  window.addEventListener('touchmove', function(event) {
    event.preventDefault()
  }, false)

  canvas = document.getElementById("canvas")
  window.context = canvas.getContext("2d")

  canvas.width = width
  canvas.height = height

  px = mouseX
  py = mouseY
  clearInterval(interval)
  interval = window.setInterval(draw, 1000 / frameRate)
}

window.onload = restart

window.onresize = restart

var touchMove = function(e) {
    mouseX = e.touches[0].clientX
    mouseY = e.touches[0].clientY 
}
var mouseMove = function(e) {
    mouseX = e.clientX
    mouseY = e.clientY
}

var clear = function(){
    context.clearRect(0, 0, width, height)
    col = parseInt(Math.random()*360)
    vms = []
}

function detectDouble(e){
  nowTouch = new Date()
  if (nowTouch - prevTouch < 500) clear()
  prevTouch = nowTouch
}

  window.addEventListener('mousemove', mouseMove, false)
  window.addEventListener('touchmove', touchMove, false)
  window.addEventListener('mousedown', clear, false)
  window.addEventListener('touchstart', detectDouble, false)

var check = function()
{
  var x0 = mouseX
    , y0 = mouseY
    , vx = x0 - px
    , vy = y0 - py
    , len = Math.min( math.dist(0,0, vx, vy ), 50 )

  if( isNaN(len) || len<10 ) return

  mtx = new PMatrix2D()
  mtx.rotate( Math.atan2( vy, vx ) )
  mtx.translate( x0, y0 )

  createObj( mtx, len )

  px = x0
  py = y0
}

var createObj = function( mtx, len )
{
  var angle = math.random(Math.PI/64,Math.PI/12)
  if( Math.random()>0.5 )
    angle *= -1
  var tmt = new PMatrix2D()
  tmt.scale( 0.95, 0.95 )
  tmt.rotate( angle )
  tmt.translate( len, 0 )
  var w = 0.5
     
  var obj = {}
  obj.c1x = obj.p1x = -w * mtx.c + mtx.tx
  obj.c1y = obj.p1y = -w * mtx.d + mtx.ty
  obj.c2x = obj.p2x =  w * mtx.c + mtx.tx
  obj.c2y = obj.p2y =  w * mtx.d + mtx.ty
  obj.vmt = mtx
  obj.tmt = tmt
  obj.r   = angle
  obj.w   = len/2
  obj.count = 0
  
  vms.push( obj )
  if( vms.length > MAX_NUM )
    vms.shift()
}

var drawWorm = function( obj )
{
  if( Math.random()>0.9 ){
    obj.tmt.rotate( -obj.r*2 )
    obj.r *= -1
  }
  obj.vmt.prepend( obj.tmt )
  var cc1x = -obj.w*obj.vmt.c + obj.vmt.tx
    , cc1y = -obj.w*obj.vmt.d + obj.vmt.ty
    , pp1x = (obj.c1x+cc1x)/2
    , pp1y = (obj.c1y+cc1y)/2

  var cc2x = obj.w*obj.vmt.c + obj.vmt.tx
    , cc2y = obj.w*obj.vmt.d + obj.vmt.ty
    , pp2x = (obj.c2x+cc2x)/2
    , pp2y = (obj.c2y+cc2y)/2

  var sx = Math.abs(obj.p1x-obj.p2x)
    , sy = Math.abs(obj.p1y-obj.p2y)
    , cx = Math.min(obj.p1x,obj.p2x) + sx/2
    , cy = Math.min(obj.p1y,obj.p2y) + sy/2
  
  var dist = math.dist(obj.p1x,obj.p1y,pp1x,pp1y)

  context.beginPath()

  context.moveTo(
    obj.p1x, obj.p1y
  )

  context.bezierCurveTo(
    obj.c1x, obj.c1y,
    obj.c1x, obj.c1y,
    pp1x , pp1y
  )

  context.bezierCurveTo(
    cx + (pp1x - cx)*cur , cy + (pp1y - cy)*cur,
    cx + (pp2x - cx)*cur , cy + (pp2y - cy)*cur,
    pp2x, pp2y
  )

  context.bezierCurveTo(
    obj.c2x, obj.c2y,
    obj.c2x, obj.c2y,
    obj.p2x, obj.p2y
  )
  if (obj.pcx) {
    context.bezierCurveTo(
      obj.pcx + (obj.p2x - obj.pcx)*cur , obj.pcy + (obj.p2y - obj.pcy)*cur,
      obj.pcx + (obj.p1x - obj.pcx)*cur , obj.pcy + (obj.p1y - obj.pcy)*cur,
      obj.p1x, obj.p1y
    )
  }
  obj.pcx = cx
  obj.pcy = cy

  context.fillStyle = 'hsl('+col+',100%,'+(parseInt(dist*1.25))+'%)'
  context.strokeStyle = 'rgba(0,0,0,'+dist+')'
  context.lineWidth = Math.min(dist,0.5)
  context.stroke()
  context.fill()

  obj.c1x = cc1x
  obj.c1y = cc1y
  obj.p1x = pp1x
  obj.p1y = pp1y
  obj.c2x = cc2x
  obj.c2y = cc2y
  obj.p2x = pp2x
  obj.p2y = pp2y
}

var draw = function () {
  var len = vms.length
  //col += 1
  for( var i=0; i<len; i++ )
  {

    var o = vms[i]

    if( o.count<N ){
      drawWorm( o )
      o.count++
    }else{

      len--
      vms.splice( i, 1 )
      i--
    }
  }
  
  check()
}

/*PMatrix2D ported from http://www.libspark.org/wiki/nutsu/Frocessing*/
function PMatrix2D(){
  this.update = function(a ,b ,c ,d , tx, ty){
    this.a  = a 
    this.b  = b 
    this.c  = c 
    this.d  = d 
    this.tx = tx
    this.ty = ty
  }

  this.prepend = function( mtx ){
    var a  = mtx.a  * this.a + mtx.b  * this.c
      , b  = mtx.a  * this.b + mtx.b  * this.d
      , c  = mtx.c  * this.a + mtx.d  * this.c
      , d  = mtx.c  * this.b + mtx.d  * this.d
      , tx = mtx.tx * this.a + mtx.ty * this.c + this.tx
      , ty = mtx.tx * this.b + mtx.ty * this.d + this.ty
    
    this.update(a ,b ,c ,d , tx, ty)
  }
  
  this.rotate = function( angle ){
    //c, s, -s, c, 0, 0
    var s = Math.sin(angle)
      , cs = Math.cos(angle)
      , a  = this.a  * cs - this.b  * s
      , b  = this.a  * s  + this.b  * cs
      , c  = this.c  * cs - this.d  * s
      , d  = this.c  * s  + this.d  * cs
      , tx = this.tx * cs - this.ty * s
      , ty = this.tx * s  + this.ty * cs

    this.update(a ,b ,c ,d , tx, ty)
  }
  
  this.scale = function( sx, sy ){
    //sx,0,0,sx,0,0
    this.a  *= sx;this.b  *= sy
    this.c  *= sx;this.d  *= sy

    this.tx *= sx
    this.ty *= sy
  }
  
  this.translate = function( x, y ){
    //1,0,0,1,x,y
    this.tx += x
    this.ty += y
  }

  // Ctor
  this.update(1.0,0.0,0.0,1.0,0.0,0.0)
}

