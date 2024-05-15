package com.example.atdmobile

import android.content.ContextParams
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.CheckBox
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.android.volley.Request
import com.android.volley.Response
import com.android.volley.toolbox.JsonObjectRequest
import com.android.volley.toolbox.StringRequest
import com.android.volley.toolbox.Volley
import org.json.JSONArray;
import org.json.JSONObject;


class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_main)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }
        var i = Intent(this, HomePage::class.java)
        var shp = getSharedPreferences("save", MODE_PRIVATE)
        val isConnected = shp.getString("isConnected", "")
        if(isConnected != ""){
            startActivity(i)
            finish()
        }
        var loginBtn = findViewById<Button>(R.id.loginBtn)
        loginBtn.setOnClickListener(){
            val userInput = findViewById<EditText>(R.id.emailUsernameInput).text.toString()
            val password = findViewById<EditText>(R.id.passwordInput).text.toString()
            val jsonBody = JSONObject()
            jsonBody.put("username", userInput)
            jsonBody.put("password", password)


            val queue = Volley.newRequestQueue(this)
            val url = "https://api.autempsdonne.lol/login"
            val jsonObjectRequest = JsonObjectRequest(
                Request.Method.POST,
                url,
                jsonBody,
                {response ->
                    val jwt = response.getString("jwt")
                    var editor = shp.edit()
                    editor.putString("jwt", jwt)
                    editor.apply()
                    if(findViewById<CheckBox>(R.id.stayConnectedCheckbox).isChecked){
                        editor.putString("isConnected", "yes")
                        editor.apply()
                    }
                    startActivity(i)
                    finish()
                },
                { error ->
                    Log.e("ErrorServer", error.toString())
                    findViewById<TextView>(R.id.errorMsg).text = error.toString()
                })
            queue.add(jsonObjectRequest)
        }
    }
}