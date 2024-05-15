package com.example.atdmobile

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.Gravity
import android.view.View
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.DatePicker
import android.widget.EditText
import android.widget.Spinner
import android.widget.TextView
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import arrow.core.getOrElse
import com.android.volley.Request
import com.android.volley.toolbox.JsonObjectRequest
import com.android.volley.toolbox.Volley
import io.github.nefilim.kjwt.JWT
import org.json.JSONObject
import java.time.LocalDate
import java.util.ArrayList
import java.util.Calendar

class GetProduct : AppCompatActivity(), AdapterView.OnItemSelectedListener {
    var listType = arrayListOf("Food", "Drink")
    var collectDateList = mutableListOf<String>()
    var collectIdList = mutableListOf<String>()
    var mutableCategories = arrayListOf("", "Viande","Poisson","Légumes","Fruits","Pain","Féculents","Conserves","Eau","Soda","Jus","Produits laitiers","Oeufs")
    var expiryDate = LocalDate.now().toString()
    lateinit var user: User

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_get_product)
        var shp = getSharedPreferences("save", MODE_PRIVATE)
        val jwt = shp.getString("jwt", "")
        decodeToken(jwt.toString())
        getCollects()
        var datePicker = findViewById<DatePicker>(R.id.date_Picker)
        val today = Calendar.getInstance()
        datePicker.init(today.get(Calendar.YEAR), today.get(Calendar.MONTH),today.get(Calendar.DAY_OF_MONTH)) { view, year, month, day ->
            val month = month + 1
            expiryDate = "$year-$month-$day"
        }
        setCategoriesInSpinner(mutableCategories)
        setTypeInSpinner(listType)
        var barcodeValue = intent.getStringExtra("barcode").toString()
        findViewById<TextView>(R.id.barcode_input).setText(barcodeValue)

        var addProductBtn = findViewById<Button>(R.id.addProductBtn)
        addProductBtn.setOnClickListener(){
            val barcode = findViewById<EditText>(R.id.barcode_input).text.toString()
            val amount = findViewById<EditText>(R.id.quantityInput).text.toString()
            val spinnerCollectId = findViewById<Spinner>(R.id.collectIdSpinner)
            var collectId = 0
            for (i in 0 ..< collectDateList.size){
                Log.d("checkSpinnerData", collectDateList.get(i) + " " + spinnerCollectId.getSelectedItem().toString())
                Log.d("checkSpinnerData",(collectDateList.get(i) == spinnerCollectId.getSelectedItem().toString()).toString())
                if(collectDateList.get(i) == spinnerCollectId.getSelectedItem().toString()){
                    collectId=collectIdList.get(i).toInt()
                }
            }
            val jsonBody = JSONObject()
            jsonBody.put("barcode", barcode)
            jsonBody.put("amount", amount)
            jsonBody.put("collect_id", collectId)
            jsonBody.put("expiry_date", expiryDate)
            if(findViewById<Spinner>(R.id.catSpinner).getSelectedItem().toString() != ""){
                jsonBody.put("category", findViewById<Spinner>(R.id.catSpinner).getSelectedItem().toString())
            }
            jsonBody.put("type", findViewById<Spinner>(R.id.typeSpinner).getSelectedItem().toString())

            val queue = Volley.newRequestQueue(this)
            val url = "https://api.autempsdonne.lol/api/warehouse/getCollectProduct"
            val headers = HashMap<String, String>()
            headers["Authorization"] = user.jwt
            val jsonObjectRequest = object : JsonObjectRequest(
                Method.POST,
                url,
                jsonBody,
                {response ->
                    var i = Intent(this, ScanBarcode::class.java)
                    i.putExtra("redirect", "get")
                    startActivity(i)
                    finish()
                },
                { error ->
                    Log.d("errorAPI", error.toString())
                    findViewById<TextView>(R.id.errorMsg).text = "Erreur durant l'ajout, ajouter manuellement ?"
                }) {
                override fun getHeaders(): MutableMap<String, String> {
                    return headers
                }
            }
            queue.add(jsonObjectRequest)
        }
        onBackPressedDispatcher.addCallback(this, onBackInvokedCallBack)
    }

    private val onBackInvokedCallBack = object : OnBackPressedCallback(true){
        override fun handleOnBackPressed() {
            var i = Intent(applicationContext, HomePage::class.java)
            startActivity(i)
            finish()
        }
    }

    fun setTypeInSpinner(typeList : ArrayList<String>) {
        var aa = ArrayAdapter(this, android.R.layout.simple_spinner_item, typeList)
        aa.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        with(findViewById<Spinner>(R.id.typeSpinner)){
            adapter = aa
            setSelection(0, false)
            onItemSelectedListener = this@GetProduct
            prompt = "Choissiez un type de produit"
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

    fun getCollects() {
        try {
            val queue = Volley.newRequestQueue(this)
            val url = "https://api.autempsdonne.lol/api/collects/get/getCollectsByDriver/${user.userId}"

            val headers = HashMap<String, String>()
            headers["Authorization"] = user.jwt
            val jsonObjectRequest = object : JsonObjectRequest(Request.Method.GET, url, null,
                { response ->
                    var collects = response.getJSONArray("collects")
                    for (i in 0 ..< collects.length()){
                        var collect = collects.getJSONObject(i)
                        collectDateList.add(collect.getString("start_date").toString() + " - " + collect.getString("end_date").toString())
                        collectIdList.add(collect.getInt("id").toString())
                        Log.d("Collect", collect.getInt("id").toString());
                        Log.d("Collect", collect.getString("start_date") + " - " + collect.getString("end_date").toString());
                    }
                    setCollectInSpinner(collectDateList)
                },
                { error -> Log.d("debugCollect1", error.toString()); }){
                override fun getHeaders(): MutableMap<String, String> {
                    return headers
                }
            }
            queue.add(jsonObjectRequest)
        }catch (e: Exception){
            runOnUiThread(){
                Toast.makeText(applicationContext, "Erreur durant le chargement des collectes", Toast.LENGTH_LONG).show()
            }
            Log.d("debugCollect", e.toString());
        }
    }

    fun setCollectInSpinner(collectList: MutableList<String>){
        var aa = ArrayAdapter(this, android.R.layout.simple_spinner_item, collectList)
        aa.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        with(findViewById<Spinner>(R.id.collectIdSpinner)){
            adapter = aa
            setSelection(0, false)
            onItemSelectedListener = this@GetProduct
            prompt = "Choissiez une collecte"
            gravity = Gravity.CENTER
        }
    }

    fun setCategoriesInSpinner(catList : ArrayList<String>) {
        var aa = ArrayAdapter(this, android.R.layout.simple_spinner_item, catList)
        aa.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        with(findViewById<Spinner>(R.id.catSpinner)){
            adapter = aa
            setSelection(0, false)
            onItemSelectedListener = this@GetProduct
            prompt = "Choisissez une catégorie"
            gravity = Gravity.CENTER
        }
    }

    override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
    }

    override fun onNothingSelected(parent: AdapterView<*>?) {
    }

}