package com.example.atdmobile

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.BaseAdapter
import android.widget.TextView
import com.example.atdmobile.models.Event
import com.example.atdmobile.models.Formation

class EventAdapter: BaseAdapter {
    var context: Context
    var levents :MutableList<Event>

    constructor(context: Context, levents: MutableList<Event>) : super() {
        this.context = context
        this.levents = levents
    }

    override fun getCount(): Int {
        return levents.size
    }

    override fun getItem(position: Int): Any {
        return levents.get(position)
    }

    override fun getItemId(position: Int): Long {
        return levents.get(position).getId().toLong()
    }

    override fun getView(position: Int, convertView: View?, parent: ViewGroup?): View {
        var v:View

        if(convertView==null){
            var inflater = LayoutInflater.from(this.context)
            v = inflater.inflate(R.layout.row_event, null)
        }else{
            v = convertView
        }
        var currentEvent = getItem(position) as Event

        if (levents.isEmpty()) {
            val inflater = LayoutInflater.from(context)
            v = inflater.inflate(R.layout.row_event, null)
            val tvNoEvents = v.findViewById<TextView>(R.id.tv_no_event)
            tvNoEvents.visibility = View.VISIBLE
            return v
        }


        val tvNoEvent = v.findViewById<TextView>(R.id.tv_no_event)
        tvNoEvent.visibility = View.GONE

        var tvEventTitle = v.findViewById<TextView>(R.id.tv_event_title)
        tvEventTitle.setText(currentEvent.getTitle())

        var tvEventType = v.findViewById<TextView>(R.id.tv_event_type)
        tvEventType.setText(currentEvent.getEventType())

        var tvEventStartDate = v.findViewById<TextView>(R.id.tv_event_startDate)
        tvEventStartDate.setText(currentEvent.getEventStartDate())

        var tvEventEndDate = v.findViewById<TextView>(R.id.tv_event_endDate)
        tvEventEndDate.setText(currentEvent.getEventEndDate())

        var tvEventPlace = v.findViewById<TextView>(R.id.tv_event_place)
        tvEventPlace.setText(currentEvent.getEventPlace())


        var tvEventResponsableName = v.findViewById<TextView>(R.id.tv_event_responsableName)
        tvEventResponsableName.setText(currentEvent.getEventResponsableName())

        var tvEventResponsableLastName = v.findViewById<TextView>(R.id.tv_event_responsableLastName)
        tvEventResponsableLastName.setText(currentEvent.getEventResponsableLastName())
        return v
    }


}