package com.example.atdmobile

import android.annotation.SuppressLint
import android.content.Intent
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout

class HarvestFragment : Fragment() {

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_harvest, container, false)
    }
    @SuppressLint("SuspiciousIndentation")
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        var btn = view.findViewById<LinearLayout>(R.id.btnGetProduct)
        btn.setOnClickListener(){
            var i = Intent(activity, ScanBarcode::class.java)
            i.putExtra("redirect", "get")
            startActivity(i)
        }
        var btn2 = view.findViewById<LinearLayout>(R.id.btnReceptProduct)
        btn2.setOnClickListener(){
            var i = Intent(activity, ScanBarcode::class.java)
            i.putExtra("redirect", "recept")
            startActivity(i)
        }
    }
}