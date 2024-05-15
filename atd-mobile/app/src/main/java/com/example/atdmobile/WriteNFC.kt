package com.example.atdmobile

import android.app.Activity
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.nfc.FormatException
import android.nfc.NdefMessage
import android.nfc.NdefRecord
import android.nfc.NdefRecord.TNF_MIME_MEDIA
import android.nfc.NfcAdapter
import android.nfc.NfcManager
import android.nfc.Tag
import android.nfc.tech.Ndef
import android.nfc.tech.NdefFormatable
import android.os.Bundle
import android.util.Log
import android.view.Gravity
import android.view.View
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.ImageView
import android.widget.Spinner
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.coordinatorlayout.widget.CoordinatorLayout.Behavior.getTag
import com.android.volley.toolbox.JsonObjectRequest
import com.android.volley.toolbox.Volley
import org.json.JSONObject
import java.io.IOException
import java.lang.String.format
import java.nio.charset.Charset
import java.util.Arrays
import java.util.Locale

class WriteNFC : AppCompatActivity(), NfcAdapter.ReaderCallback, AdapterView.OnItemSelectedListener {
    var mutableUserFullName = mutableListOf<String>()
    var mutableUserId = mutableListOf<Int>()
    private var nfcAdapter: NfcAdapter? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        val errorNFC = findViewById<TextView>(R.id.errorMsgWriteNFC)
        try {
            super.onCreate(savedInstanceState)
            setContentView(R.layout.activity_write_nfc)
            nfcAdapter = NfcAdapter.getDefaultAdapter(this)

            if (nfcAdapter == null) {
                Toast.makeText(this, "Cet appareil ne supporte pas le NFC.", Toast.LENGTH_SHORT).show()
                finish()
            }

            if (!nfcAdapter!!.isEnabled) {
                Toast.makeText(this, "Erreur : Activez le NFC dans les paramètres de votre appareil.", Toast.LENGTH_SHORT).show()
                finish()
            }

            val goBack = findViewById<ImageView>(R.id.goBackEderlyHome)
            goBack.setOnClickListener(){
                finish()
            }

            getUsersList()
        }catch (error : Exception){
            errorNFC.setText(error.toString())
            Log.e("errorSpinner", error.toString())
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

    fun getIdByFullName(fullname: String): String{
        for (i in 0 until mutableUserFullName.size){
            if(mutableUserFullName.get(i) == fullname){
                return mutableUserId.get(i).toString()
            }
        }
        return ""
    }

    override fun onTagDiscovered(tag: Tag?) {
        val errorNFC = findViewById<TextView>(R.id.errorMsgWriteNFC)
        val successNFC = findViewById<TextView>(R.id.successNfcMsgWriteNFC)
        try {
            val spinnerUser = findViewById<Spinner>(R.id.userListSpinner)
            val fullName = spinnerUser.getSelectedItem().toString()
            val beneficiaryId = getIdByFullName(fullName);
            if(beneficiaryId == "") return
            val mimeId = NdefRecord.createMime("application/atdmobile", beneficiaryId.toByteArray())
            val mimeFullName = NdefRecord.createMime("application/atdmobile", fullName.toByteArray())
            val message = NdefMessage(arrayOf(mimeId, mimeFullName))
            tag?.let {
                val ndef = Ndef.get(it)
                if (ndef != null) {
                    ndef.connect()
                    ndef.writeNdefMessage(message)
                    ndef.close()
                    runOnUiThread {
                        successNFC.setText("NFC écrit avec succès !")
                    }
                } else {
                    runOnUiThread {
                        errorNFC.setText("Erreur: La puce NFC n'est pas compatible avec l'écriture de données.")
                    }
                }
            }
        }catch (e: Exception){
            runOnUiThread {
                errorNFC.setText(e.toString())
            }
            Log.e("ErrorWrite", e.toString())
        }
    }

    fun setUserInSpinner(userList : MutableList<User>) {
        for(i in 0 until userList.size){
            mutableUserFullName.add(userList.get(i).name + " " + userList.get(i).lastname)
            mutableUserId.add(userList.get(i).userId)
        }
        var aa = ArrayAdapter(this, android.R.layout.simple_spinner_item, mutableUserFullName)
        aa.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        with(findViewById<Spinner>(R.id.userListSpinner)){
            adapter = aa
            setSelection(0, false)
            onItemSelectedListener = this@WriteNFC
            prompt = "Assigner à un utilisateur"
            gravity = Gravity.CENTER
        }
    }
    fun getUsersList(){
        val errorNFC = findViewById<TextView>(R.id.errorMsgWriteNFC)
        try {
                var shp = getSharedPreferences("save", MODE_PRIVATE)
                val jwt = shp.getString("jwt", "")

                val queue = Volley.newRequestQueue(applicationContext)
                val url = "https://api.autempsdonne.lol/users"
                val headers = HashMap<String, String>()
                headers["Authorization"] = jwt.toString()

                var jsonObjectRequest = object : JsonObjectRequest(Method.GET, url, null,
                    { response ->
                        var userArray = response.getJSONArray("users")
                        var userList = mutableListOf<User>()
                        for (i in 0 until userArray.length()){
                            var userObject = userArray.getJSONObject(i)
                            val userId = userObject.getInt("id")
                            val username = userObject.getString("username")
                            val name = userObject.getString("name")
                            val lastname = userObject.getString("lastname")
                            val rank = userObject.getInt("rank")
                            val pfp = ""
                            userList.add(User(username, rank, userId, pfp, name, lastname, ""))
                    }
                        setUserInSpinner(userList)
                    },
                    { error ->
                        runOnUiThread {
                            Toast.makeText(this, "Erreur", Toast.LENGTH_SHORT).show()
                            errorNFC.setText("Erreur : " + error.toString())
                        }
                        Log.e("ErrorUserList", error.toString())
                    }) {
                    override fun getHeaders(): MutableMap<String, String> {
                        return headers
                    }
                }
                queue.add(jsonObjectRequest)
            }catch (e: Exception){
                runOnUiThread {
                    errorNFC.setText("Erreur : " + e.toString())
                }
                Log.e("ErrorUserList", e.toString())
            }
    }
    override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {

    }

    override fun onNothingSelected(parent: AdapterView<*>?) {

    }
}
