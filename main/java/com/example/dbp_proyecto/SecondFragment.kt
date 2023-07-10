package com.example.dbp_proyecto

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.navigation.fragment.findNavController
import com.example.dbp_proyecto.databinding.FragmentFirstBinding
import com.example.dbp_proyecto.Utility
import android.util.Log
import com.android.volley.Request
import com.android.volley.toolbox.JsonArrayRequest
import com.android.volley.toolbox.Volley
import org.json.JSONArray

/**
 * A simple [Fragment] subclass as the default destination in the navigation.
 */
class SecondFragment : Fragment() {

    fun fetch(textView:TextView,method:String){
        val url="http://192.168.1.15:5000/"
        lateinit var jsonArray: JSONArray

        val queue= Volley.newRequestQueue(textView.context)
        val jsonRequest= JsonArrayRequest(
            Request.Method.GET, url +method,null,
            {response->
                var get=""
                jsonArray =response

                if(method==="animations") {
                    for (i in 0 until jsonArray.length()) {
                        val item = jsonArray.getJSONObject(i)
                        get+= "animation: " + item.getString("name") + ", "
                        get+= "author: " + item.getString("email_user") + "\n"
                    }
                }
                else if(method==="frames"){
                    for (i in 0 until jsonArray.length()) {
                        val item = jsonArray.getJSONObject(i)
                        get+="animation id: "+item.getString("id_anim")+", "
                        get+="frame number: " + item.getString("frame_n") + "\n"
                    }
                }
                
                textView.text=get
            },
            {error->
                textView.text=error.toString()
            }
        )
        queue.add(jsonRequest)
    }

    private var _binding: FragmentFirstBinding? = null
    private lateinit var textView: TextView

    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {

        _binding = FragmentFirstBinding.inflate(inflater, container, false)

        val rootView=inflater.inflate(R.layout.fragment_second,container,false)
        textView=rootView.findViewById(R.id.textview_second)

        return binding.root

    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        fetch(textView,"frames")

        binding.buttonFirst.setOnClickListener {
            findNavController().navigate(R.id.action_SecondFragment_to_FirstFragment)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}