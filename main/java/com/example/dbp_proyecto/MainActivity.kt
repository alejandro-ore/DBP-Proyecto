package com.example.dbp_proyecto

import android.content.Context
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.navigation.findNavController
import androidx.navigation.ui.AppBarConfiguration
import androidx.navigation.ui.navigateUp
import android.view.Menu
import android.view.View
import android.widget.TextView
import com.example.dbp_proyecto.databinding.ActivityMainBinding
import org.json.JSONArray
import com.android.volley.*
import com.android.volley.toolbox.*
import android.graphics.*
import android.widget.FrameLayout

const val url="http://192.168.1.15:5000/"

fun clamp(value: Int, min: Int, max: Int): Int {
    return when {
        value < min -> min
        value > max -> max
        else -> value
    }
}

class PixelScreenView(context: Context) : View(context) {
    private val pixelPaint = Paint()

    private val n=160
    private val m=90

    private var pixelData="5".repeat(m*n)

    val borderPaint = Paint().apply {
        color = Color.BLACK
        style = Paint.Style.STROKE
        strokeWidth = 10f
    }

    fun updateCanvas(str:String){
        pixelData=str
        invalidate()
    }

    override fun onDraw(canvas: Canvas?) {
        super.onDraw(canvas)

        val rowCount = m
        val columnCount = n

        val screenWidth = width.toFloat()
        val screenHeight = height.toFloat()

        val maxPixelSize = minOf(screenWidth / columnCount, screenHeight / rowCount)

        val totalPixelScreenHeight = rowCount * maxPixelSize
        val yOffset = (screenHeight - totalPixelScreenHeight) / 2

        var num=0

        canvas?.apply {
            val borderLeft = 0f
            val borderTop = yOffset
            val borderRight = screenWidth
            val borderBottom = totalPixelScreenHeight + yOffset
            drawRect(borderLeft, borderTop, borderRight, borderBottom, borderPaint)

            for (i in 0..m-1){
                for (j in 0..n-1) {
                    val left = j * maxPixelSize
                    val top = i * maxPixelSize + yOffset
                    val right = left + maxPixelSize
                    val bottom = top + maxPixelSize

                    pixelPaint.color =when(pixelData[num]) {
                        '1'->Color.RED
                        '2'->Color.YELLOW
                        '3'->Color.GREEN
                        '4'->Color.BLUE
                        '5'->Color.BLACK
                        else->Color.WHITE
                    }
                    num++
                    drawRect(left, top, right, bottom, pixelPaint)
                }
            }
        }
    }

}

class MainActivity : AppCompatActivity() {
    private lateinit var appBarConfiguration: AppBarConfiguration
    private lateinit var binding: ActivityMainBinding
    lateinit var pixelScreenView:PixelScreenView
    private lateinit var animations:JSONArray
    private lateinit var textView:TextView
    var current_animation=0

    fun getAnimations(callback:(JSONArray)->Unit){
        val jsonArray=JSONArray()
        val queue = Volley.newRequestQueue(textView.context)
        val request = JsonArrayRequest(Request.Method.GET,url+"animations", null,
            { response ->
                jsonArray.put(response)
                callback(jsonArray)
            },
            { error ->
                callback(jsonArray)
            }
        )
        queue.add(request)
    }

    fun getFrames(id:String,callback:(JSONArray)->Unit){
        var jsonArray=JSONArray()
        val queue = Volley.newRequestQueue(textView.context)
        val request = JsonArrayRequest(Request.Method.GET,url+"frames/animations/"+id, null,
            { response ->
                jsonArray.put(response)
                callback(jsonArray)
            },
            { error ->
                callback(jsonArray)
            }
        )
        queue.add(request)
    }

    fun play(n:Int){
        current_animation=clamp(n,0,animations.length()-1)
        val current_id=animations.getJSONObject(current_animation).getString("id")
        var text=animations.getJSONObject(current_animation).getString("name")+"\n"
        text+="Author: "+animations.getJSONObject(current_animation).getString("email_user")
        textView.text=text
        var frames=JSONArray()
        getFrames(current_id){
                json2->frames=json2[0] as JSONArray
            val handler=Handler(Looper.getMainLooper())
            for(i in 0 until frames.length()){
                val frame=frames.getJSONObject(i).getString("data")
                handler.postDelayed({
                    pixelScreenView.updateCanvas(frame)
                },(i*10000/24).toLong())
            }
        }
    }

    fun next(){
        current_animation++
        play(current_animation)
    }

    fun previous(){
        current_animation--
        play(current_animation)
    }

    fun fetch(){
        getAnimations(){json1->
            animations=json1[0] as JSONArray
            play(0)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        WindowCompat.setDecorFitsSystemWindows(window, false)
        super.onCreate(savedInstanceState)

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)

        textView=findViewById<TextView>(R.id.textview_first)

        pixelScreenView = PixelScreenView(this)
        findViewById<FrameLayout>(R.id.pixelScreenContainer).addView(pixelScreenView)

        fetch()
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.menu_main, menu)
        return true
    }

    override fun onSupportNavigateUp(): Boolean {
        val navController = findNavController(R.id.nav_host_fragment_content_main)
        return navController.navigateUp(appBarConfiguration)
                || super.onSupportNavigateUp()
    }
}