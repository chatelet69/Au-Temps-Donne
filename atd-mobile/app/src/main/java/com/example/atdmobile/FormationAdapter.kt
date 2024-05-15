package com.example.atdmobile

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.BaseAdapter
import android.widget.TextView
import com.example.atdmobile.models.Event
import com.example.atdmobile.models.Formation

class FormationAdapter: BaseAdapter {
    var context: Context
    var lvformations :MutableList<Formation>

    constructor(context: Context, lvformations: MutableList<Formation>) : super() {
        this.context = context
        this.lvformations = lvformations
    }

    override fun getCount(): Int {
        return lvformations.size
    }

    override fun getItem(position: Int): Any {
        return lvformations.get(position)
    }

    override fun getItemId(position: Int): Long {
        return lvformations.get(position).getId().toLong()
    }

    override fun getView(position: Int, convertView: View?, parent: ViewGroup?): View {
        var v:View

        if (convertView == null) {
            val inflater = LayoutInflater.from(context)
            v = inflater.inflate(R.layout.row_formation, null)
        } else {
            v = convertView
        }

        if (lvformations.isEmpty()) {
            val inflater = LayoutInflater.from(context)
            v = inflater.inflate(R.layout.row_formation, null)
            val tvNoFormations = v.findViewById<TextView>(R.id.tv_no_formations)
            tvNoFormations.visibility = View.VISIBLE
            return v
        }

        var currentFormation = getItem(position) as Formation

        var tvFormationTitle = v.findViewById<TextView>(R.id.tv_formation_title)
        tvFormationTitle.setText(currentFormation.getTitle())

        val tvNoFormations = v.findViewById<TextView>(R.id.tv_no_formations)
        tvNoFormations.visibility = View.GONE

        var tvFormationType = v.findViewById<TextView>(R.id.tv_formation_type)
        tvFormationType.setText(currentFormation.getFormationType())

        var tvFormationStartDate = v.findViewById<TextView>(R.id.tv_formation_startDate)
        tvFormationStartDate.setText(currentFormation.getFormationStartDate())

        var tvFormationEndDate = v.findViewById<TextView>(R.id.tv_formation_endDate)
        tvFormationEndDate.setText(currentFormation.geFormationEndDate())

        var tvFormationPlace = v.findViewById<TextView>(R.id.tv_formation_place)
        tvFormationPlace.setText(currentFormation.getFormationPlace())

        var tvFormationResponsableName = v.findViewById<TextView>(R.id.tv_formation_responsableName)
        tvFormationResponsableName.setText(currentFormation.getFormationResponsableName())

        var tvFormationResponsableLastName = v.findViewById<TextView>(R.id.tv_formation_responsableLastName)
        tvFormationResponsableLastName.setText(currentFormation.getFormationResponsableLastName())
        return v
    }
}