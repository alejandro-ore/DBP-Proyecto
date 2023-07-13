package com.example.dbp_proyecto

import android.app.Activity
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.navigation.fragment.findNavController
import com.example.dbp_proyecto.databinding.FragmentFirstBinding

/**
 * A simple [Fragment] subclass as the default destination in the navigation.
 */
class FirstFragment : Fragment() {

    private var _binding: FragmentFirstBinding? = null
    private lateinit var textView:TextView
    private lateinit var mainActivity:Activity
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {

        mainActivity=activity as MainActivity
        _binding = FragmentFirstBinding.inflate(inflater, container, false)

        val rootView=inflater.inflate(R.layout.fragment_first,container,false)
        textView=rootView.findViewById(R.id.textview_first)

        return binding.root

    }

    private var clickable=true

    fun buttonDelay() {
        clickable=false
        Handler(Looper.getMainLooper()).postDelayed({
            clickable=true
        },(1000).toLong())
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.buttonNext.setOnClickListener {
            if(clickable){
                (mainActivity as MainActivity).next()
                buttonDelay()
            }
        }

        binding.buttonPrev.setOnClickListener {
            if(clickable){
                (mainActivity as MainActivity).previous()
                buttonDelay()
            }
        }

        binding.fab.setOnClickListener{
            findNavController().navigate(R.id.action_firstFragment_credits)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}