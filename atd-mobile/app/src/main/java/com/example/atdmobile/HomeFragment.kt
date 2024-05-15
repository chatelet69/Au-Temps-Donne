package com.example.atdmobile

import android.graphics.Color
import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.CalendarView
import android.widget.ListView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import arrow.core.getOrElse
import com.android.volley.toolbox.JsonObjectRequest
import com.android.volley.toolbox.Volley
import com.example.atdmobile.models.Event
import com.example.atdmobile.models.Formation
import io.github.nefilim.kjwt.JWT
import java.text.Format
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

class HomeFragment : Fragment() {
    var homeView: View? = null
    var userJwt: String = ""

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val calendarView = view.findViewById<CalendarView>(R.id.calendarView)

        homeView = view
        var shp = requireContext().getSharedPreferences("save", AppCompatActivity.MODE_PRIVATE)
        val token = shp.getString("jwt", "").toString()
        userJwt = token
        JWT.decode(token).tap { jwt ->
            val decoded = jwt.claimValue("username").getOrElse { "" }
            println("JWTT " + decoded)
        }

        val currentDate = Calendar.getInstance()
        getEventsList(currentDate)
        getFormationList(currentDate)


        calendarView.setOnDateChangeListener { _, year, month, dayOfMonth ->
            val selectedDate = Calendar.getInstance()
            selectedDate.set(year, month, dayOfMonth)

            getEventsList(selectedDate)
            getFormationList(selectedDate)
        }

        // val b1 = view.findViewById<LinearLayout>(R.id.btnAssignNFC)
        /*b1.setOnClickListener(){
            Toast.makeText(requireContext(), "ok", Toast.LENGTH_SHORT).show()
        }*/
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?

    ): View? {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_home, container, false)
    }

    fun getEventsList(date: Calendar){
        try {
            val queue = Volley.newRequestQueue(requireContext().applicationContext)
            val date = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(date.time)
            val url = "https://api.autempsdonne.lol/events/getEventByContributors/$date"


            val headers = HashMap<String, String>()
            headers["Authorization"] = userJwt

            var jsonObjectRequest = object : JsonObjectRequest(
                Method.GET, url, null,
                { response ->
                    var eventsArray = response.getJSONArray("events")
                    var eventsList = mutableListOf<Event>()
                    for (i in 0 until eventsArray.length()){
                        var userObject = eventsArray.getJSONObject(i)
                        val eventId = userObject.getInt("event_id_fk")
                        val user = userObject.getInt("user_id_fk")
                        val eventType = userObject.getString("name")
                        val title = userObject.getString("title")
                        val startDate = userObject.getString("start_datetime_formated")
                        val endDate = userObject.getString("end_datetime_formated")
                        val responsableId = userObject.getInt("responsable")
                        val description = userObject.getString("description")
                        val place = userObject.getString("place")
                        val collectName = userObject.getString("name")
                        val responsableLastname = userObject.getString("responsableLastname")
                        val responsableName = userObject.getString("responsableName")
                        eventsList.add(Event(eventId, user, eventType, title, startDate, endDate, responsableId, description, place, collectName, responsableLastname,responsableName))
                    }

                    if (eventsList.isEmpty()) {
                        var lv = view?.findViewById<ListView>(R.id.lv_events_of_date)
                        val tvNoEvent = TextView(requireContext())
                        tvNoEvent.text = "Aucun Evenement"
                        tvNoEvent.setBackgroundColor(Color.parseColor("#0D1A30"))
                        lv?.adapter = ArrayAdapter<String>(requireContext(), android.R.layout.simple_list_item_1, arrayListOf(tvNoEvent.text.toString()))
                    } else {
                        val lv = view?.findViewById<ListView>(R.id.lv_events_of_date)
                        var adap = EventAdapter(requireContext(), eventsList)
                        lv?.adapter = adap
                    }
                },
                { error ->
                        Log.e("ErrorUserList", error.toString())
                }) {
                override fun getHeaders(): MutableMap<String, String> {
                    return headers
                }
            }
            queue.add(jsonObjectRequest)
        } catch (e: Exception){
            //runOnUiThread {
            //    errorNFC.setText("Erreur : " + e.toString())
            //}
            //Log.e("ErrorUserList", e.toString())
        }
    }

    fun getFormationList(date: Calendar){
        try {
            val queue = Volley.newRequestQueue(requireContext().applicationContext)
            val date = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(date.time)
            val url = "https://api.autempsdonne.lol/api/formations/getAllFormationsByUser/$date"

            val headers = HashMap<String, String>()
            headers["Authorization"] = userJwt

            var jsonObjectRequest = object : JsonObjectRequest(
                Method.GET, url, null,
                { response ->
                    var formationsArray = response.getJSONArray("formations")
                    var formationsList = mutableListOf<Formation>()
                    for (i in 0 until formationsArray.length()){
                        var userObject = formationsArray.getJSONObject(i)
                        val formationId = userObject.getInt("formation_id_fk")
                        val formationType = userObject.getString("formation_type")
                        val title = userObject.getString("title")
                        val startDate = userObject.getString("datetime_start_formated")
                        val endDate = userObject.getString("datetime_end_formated")
                        val description = userObject.getString("description")
                        val place = userObject.getString("place_name")
                        val responsableLastname = userObject.getString("lastname")
                        val responsableName = userObject.getString("name")
                        formationsList.add(Formation(formationId, formationType, title, description, startDate, endDate, place, responsableName, responsableLastname))
                    }
                    if (formationsList.isEmpty()) {
                        val lv = view?.findViewById<ListView>(R.id.lv_formations_of_date)
                        val tvNoFormations = TextView(requireContext())
                        tvNoFormations.text = "Aucune Formation"
                        lv?.adapter = ArrayAdapter<String>(requireContext(), android.R.layout.simple_list_item_1, arrayListOf(tvNoFormations.text.toString()))
                    } else {
                        val lv = view?.findViewById<ListView>(R.id.lv_formations_of_date)
                        var adap = FormationAdapter(requireContext(), formationsList)
                        lv?.adapter = adap
                    }
                },
                { error ->
                    Log.e("ErrorFormationList", error.toString())
                }) {
                override fun getHeaders(): MutableMap<String, String> {
                    return headers
                }
            }
            queue.add(jsonObjectRequest)
        } catch (e: Exception){
            //runOnUiThread {
            //    errorNFC.setText("Erreur : " + e.toString())
            //}
            //Log.e("ErrorUserList", e.toString())
        }
    }
}