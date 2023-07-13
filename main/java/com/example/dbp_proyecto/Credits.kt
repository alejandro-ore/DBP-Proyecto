package com.example.dbp_proyecto

import android.app.Activity
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.navigation.fragment.findNavController
import com.example.dbp_proyecto.databinding.CreditsBinding

/**
 * A simple [Fragment] subclass as the default destination in the navigation.
 */
class Credits : Fragment() {

    private var _binding: CreditsBinding? = null
    private lateinit var mainActivity: Activity
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {

        mainActivity=activity as MainActivity
        _binding = CreditsBinding.inflate(inflater, container, false)

        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        (mainActivity as MainActivity).pixelScreenView.visibility=View.GONE

        binding.buttonReturn.setOnClickListener {
            (mainActivity as MainActivity).pixelScreenView.visibility=View.VISIBLE
            findNavController().navigate(R.id.action_credits_firstFragment)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}