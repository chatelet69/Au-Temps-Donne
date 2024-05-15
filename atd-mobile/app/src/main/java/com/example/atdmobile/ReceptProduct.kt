package com.example.atdmobile

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.Gravity
import android.view.View
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.Spinner
import android.widget.TextView
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import arrow.core.getOrElse
import com.android.volley.Request
import com.android.volley.toolbox.JsonObjectRequest
import com.android.volley.toolbox.Volley
import io.github.nefilim.kjwt.JWT
import org.json.JSONObject

class ReceptProduct : AppCompatActivity(), AdapterView.OnItemSelectedListener {
    var warehouseNameList = mutableListOf<String>()
    var warehouseIdList = mutableListOf<Int>()
    var collectDateList = mutableListOf<String>()
    var collectIdList = mutableListOf<Int>()
    lateinit var user: User

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_recept_product)
        var shp = getSharedPreferences("save", MODE_PRIVATE)
        val jwt = shp.getString("jwt", "")
        decodeToken(jwt.toString())

        var barcode = intent.getStringExtra("barcode")
        findViewById<EditText>(R.id.barcodeRecept).setText(barcode)
        getCollects()
        getWarehouse()

        var btn = findViewById<Button>(R.id.receptProductBtn)
        btn.setOnClickListener(){
            var location = findViewById<EditText>(R.id.locationProduct).text
            var warehouseSpinner = findViewById<Spinner>(R.id.warehouseSpinner)
            var idEntrepot = getEquivId(warehouseSpinner.getSelectedItem().toString(), warehouseNameList, warehouseIdList)
            var collectSpinner = findViewById<Spinner>(R.id.collectReceptSpinner)
            var idCollect = getEquivId(collectSpinner.getSelectedItem().toString(), collectDateList, collectIdList)

            try {
                val queue = Volley.newRequestQueue(this)
                val url = "https://api.autempsdonne.lol/api/warehouse/receptCollectProducts"
                val headers = HashMap<String, String>()
                headers["Authorization"] = user.jwt
                var jsonBody = JSONObject()
                jsonBody.put("idEntrepot_fk", idEntrepot)
                jsonBody.put("location", location)
                jsonBody.put("collect_id", idCollect)
                jsonBody.put("barcode", barcode)
                val jsonObjectRequest = object : JsonObjectRequest(
                    Request.Method.PATCH, url, jsonBody,
                    { response ->
                        var i = Intent(this, ScanBarcode::class.java)
                        i.putExtra("redirect", "recept")
                        startActivity(i)
                        finish()
                    },
                    { error ->
                        runOnUiThread(){
                            findViewById<TextView>(R.id.errorReceptMsg).setText("Erreur durant la réception du produit")
                        }
                        Log.d("debugWarehouse0", error.toString());
                    }){
                    override fun getHeaders(): MutableMap<String, String> {
                        return headers
                    }
                }
                queue.add(jsonObjectRequest)

            }catch (e: Exception){
                findViewById<TextView>(R.id.errorReceptMsg).setText("Erreur durant la réception du produit")
                Log.d("debugWarehouse1", e.toString())
            }
        }
    }

    fun getEquivId(srch:String, listString: MutableList<String>, listId: MutableList<Int>): Int {
        for (i in 0 ..<listString.size){
            if(srch == listString.get(i)){
                return listId.get(i)
            }
        }
        return -1
    }

    fun getCollects(){
        try {
            val queue = Volley.newRequestQueue(this)
            val url = "https://api.autempsdonne.lol/api/collects/get/getCollectsByDriver/${user.userId}"
            val headers = HashMap<String, String>()
            headers["Authorization"] = user.jwt
            val jsonObjectRequest = object : JsonObjectRequest(
                Request.Method.GET, url, null,
                { response ->
                    var collects = response.getJSONArray("collects")
                    for (i in 0 ..< collects.length()){
                        var collect = collects.getJSONObject(i)
                        collectDateList.add(collect.getString("start_date").toString() + " - " + collect.getString("end_date").toString())
                        collectIdList.add(collect.getInt("id"))
                    }
                    setCollectInSpinner(collectDateList)
                },
                { error ->
                    runOnUiThread(){
                        findViewById<TextView>(R.id.errorReceptMsg).setText("Erreur durant le chargement des collectes")
                    }
                    Log.d("debugCollect1", error.toString());
                }){
                override fun getHeaders(): MutableMap<String, String> {
                    return headers
                }
            }
            queue.add(jsonObjectRequest)

        }catch (e: Exception){
            runOnUiThread(){
                findViewById<TextView>(R.id.errorReceptMsg).setText("Erreur durant le chargement des collectes")
            }
            Log.d("getCollectProbleme", e.toString())
        }
    }

    fun setCollectInSpinner(collectList: MutableList<String>){
        var aa = ArrayAdapter(this, android.R.layout.simple_spinner_item, collectList)
        aa.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        with(findViewById<Spinner>(R.id.collectReceptSpinner)){
            adapter = aa
            setSelection(0, false)
            onItemSelectedListener = this@ReceptProduct
            prompt = "Choissiez une collecte"
            gravity = Gravity.CENTER
        }
    }

    fun getWarehouse(){
        try {
            val queue = Volley.newRequestQueue(this)
            val url = "https://api.autempsdonne.lol/api/warehouses/getAll"
            val jsonObjectRequest = JsonObjectRequest(
                Request.Method.GET, url, null,
                { response ->
                    var warehouses = response.getJSONArray("warehouses")
                    for (i in 0 ..< warehouses.length()){
                        var warehouse = warehouses.getJSONObject(i)
                        warehouseNameList.add(warehouse.getString("place_name").toString())
                        warehouseIdList.add(warehouse.getInt("id"))
                    }
                    setWarehouseInSpinner(warehouseNameList)
                },
                { error ->
                    runOnUiThread(){
                        findViewById<TextView>(R.id.errorReceptMsg).setText("Erreur durant le chargement des entrepôts")
                    }
                    Log.d("debugWarehouse0", error.toString()); })
            queue.add(jsonObjectRequest)

        }catch (e: Exception){
            runOnUiThread(){
                findViewById<TextView>(R.id.errorReceptMsg).setText("Erreur durant le chargement des entrepôts")
            }
            Log.d("debugWarehouse1", e.toString())
        }
    }

    fun setWarehouseInSpinner(collectList: MutableList<String>){
        var aa = ArrayAdapter(this, android.R.layout.simple_spinner_item, collectList)
        aa.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        with(findViewById<Spinner>(R.id.warehouseSpinner)){
            adapter = aa
            setSelection(0, false)
            onItemSelectedListener = this@ReceptProduct
            prompt = "Choissiez un entrepôt"
            gravity = Gravity.CENTER
        }
    }

    fun decodeToken(token:String){
        JWT.decode(token).tap { jwt ->
            val username = jwt.claimValue("username").getOrElse { "" }
            val rank = jwt.claimValue("rank").getOrElse { "" }.toInt()
            val userId = jwt.claimValue("userId").getOrElse { "" }.toInt()
            val pfp = jwt.claimValue("pfp").getOrElse { "" }
            val name = jwt.claimValue("name").getOrElse { "" }
            val lastname = jwt.claimValue("lastname").getOrElse { "" }
            user = User(username, rank, userId, pfp, name, lastname, token)
        }
    }

    override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
    }

    override fun onNothingSelected(parent: AdapterView<*>?) {
    }
}