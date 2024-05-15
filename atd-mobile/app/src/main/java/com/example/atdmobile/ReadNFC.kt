package com.example.atdmobile

import android.app.PendingIntent
import android.content.Intent
import android.icu.util.BuddhistCalendar
import android.nfc.NdefMessage
import android.nfc.NfcAdapter
import android.nfc.Tag
import android.nfc.tech.Ndef
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import android.util.Log
import android.widget.CheckBox
import android.widget.EditText
import android.widget.ImageView
import android.widget.TextView
import com.android.volley.Request
import com.android.volley.toolbox.JsonObjectRequest
import com.android.volley.toolbox.Volley
import kotlinx.coroutines.delay
import org.json.JSONObject

class ReadNFC : AppCompatActivity(), NfcAdapter.ReaderCallback{
    private var nfcAdapter: NfcAdapter? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_read_nfc)
        val errorNFC = findViewById<TextView>(R.id.errorNfc)
        try {
            nfcAdapter = NfcAdapter.getDefaultAdapter(this)
            if (nfcAdapter == null) {
                Toast.makeText(this, "Cet appareil ne supporte pas le NFC.", Toast.LENGTH_SHORT).show()
                finish()
                return
            }

            if (!nfcAdapter!!.isEnabled) {
                errorNFC.setText("Erreur : Activez le NFC dans les paramètres de votre appareil.")
            }

            val goBack = findViewById<ImageView>(R.id.goBackEderlyHome)
            goBack.setOnClickListener(){
                finish()
            }

        }catch (e: Exception){
            Log.e("ExceptionTag", e.toString(), e)
            runOnUiThread {
                errorNFC.setText("Erreur lors du scan du NFC : " + e.toString())
            }
        }
    }

    override fun onResume() {
        super.onResume()
        nfcAdapter?.enableReaderMode(this, this, NfcAdapter.FLAG_READER_NFC_A, null)
    }

    override fun onPause() {
        super.onPause()
        nfcAdapter?.disableReaderMode(this)
    }

    override fun onTagDiscovered(tag: Tag?) {
        val errorNFC = findViewById<TextView>(R.id.errorNfc)
        val successNFC = findViewById<TextView>(R.id.successNfc)

        try {
            tag?.let {
                val ndef = Ndef.get(it)
                if (ndef == null) {
                    runOnUiThread {
                        errorNFC.setText("Le jeton NFC est vide.")
                    }
                } else {
                    var userId = "${
                        java.lang.String(
                            ndef.cachedNdefMessage?.records?.get(
                                0
                            )?.payload
                        )
                    }"
                    var fullName = "${
                        java.lang.String(
                            ndef.cachedNdefMessage?.records?.get(
                                1
                            )?.payload
                        )
                    }"
                    if(userId.length == 0 || fullName.length == 0){
                        runOnUiThread {
                            errorNFC.setText("Le jeton NFC est vide.")
                        }
                    }else{
                        val jsonBody = JSONObject()
                        jsonBody.put("idElderly", userId)
                        val queue = Volley.newRequestQueue(this)
                        val url = "https://api.autempsdonne.lol/events/elderly/visit"
                        var shp = getSharedPreferences("save", MODE_PRIVATE)
                        val jwt = shp.getString("jwt", "")
                        val headers = HashMap<String, String>()
                        headers["Authorization"] = jwt.toString()

                        val jsonObjectRequest = object : JsonObjectRequest(
                            Method.POST,
                            url,
                            jsonBody,
                            {response ->
                                runOnUiThread {
                                    errorNFC.setText("")
                                    successNFC.setText("Le NFC de ${fullName} a été scanné avec succès ! id : ${userId}")
                                }
                            },
                            { error ->
                                runOnUiThread {
                                    errorNFC.setText("Erreur lors du scan du NFC : " + error.toString())
                                }
                            }) {
                            override fun getHeaders(): MutableMap<String, String> {
                                return headers
                            }
                        }
                        queue.add(jsonObjectRequest)
                    }
                }
            }
        } catch (e: Exception) {
            Log.e("ExceptionTag2", e.toString(), e)
            runOnUiThread {
                errorNFC.setText("Votre NFC est vide")
            }
        }
    }
}

