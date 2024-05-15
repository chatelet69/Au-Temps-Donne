package com.example.atdmobile

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.MenuItem
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import android.widget.Toolbar
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.ActionBarDrawerToggle
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.GravityCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.drawerlayout.widget.DrawerLayout
import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentTransaction
import arrow.core.getOrElse
import arrow.core.toOption
import arrow.fx.coroutines.Use
import com.google.android.material.navigation.NavigationView
import io.github.nefilim.kjwt.JWT
import org.json.JSONArray
import org.json.JSONObject
import com.example.atdmobile.HomeFragment
import com.squareup.picasso.Picasso
import java.net.URI

class HomePage : AppCompatActivity(), NavigationView.OnNavigationItemSelectedListener {

    private lateinit var drawerLayout: DrawerLayout
    lateinit var user: User
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_home_page)

        enableEdgeToEdge()

        var shp = getSharedPreferences("save", MODE_PRIVATE)
        val token = shp.getString("jwt", "").toString()
        if(token == ""){
            var i = Intent(this, MainActivity::class.java)
            startActivity(i)
            finish()
        }
        decodeToken(token)

        drawerLayout = findViewById<DrawerLayout>(R.id.drawerLayout)

        val toolbar= findViewById<androidx.appcompat.widget.Toolbar?>(R.id.toolbar)
        setSupportActionBar(toolbar)

        val navigationView = findViewById<NavigationView>(R.id.nav_view)
        val headerView = navigationView.getHeaderView(0)
        val textUsername = headerView.findViewById<TextView>(R.id.text_username)
        textUsername.text = user.username

        val nameLastname = headerView.findViewById<TextView>(R.id.nameLastname)
        nameLastname.text = user.name + " " + user.lastname

        Picasso.get().load(user.pfp).into(headerView.findViewById<ImageView>(R.id.pfpBox));

        navigationView.setNavigationItemSelectedListener(this)

        val toggle = ActionBarDrawerToggle(this, drawerLayout, toolbar, R.string.open_nav, R.string.close_nav)
        drawerLayout.addDrawerListener(toggle)
        toggle.syncState()

        if(savedInstanceState == null){
            replaceFragment(HomeFragment())
            navigationView.setCheckedItem(R.id.nav_home)
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

    override fun onNavigationItemSelected(item: MenuItem): Boolean {
        when(item.itemId){
            R.id.nav_home -> replaceFragment(HomeFragment())
            R.id.nav_harvest -> replaceFragment(HarvestFragment())
            R.id.nav_stock -> replaceFragment(StockFragment())
            R.id.nav_oldpeople -> replaceFragment(EderlyFragment())
            R.id.nav_logout -> {
                Toast.makeText(applicationContext, "Logout !", Toast.LENGTH_LONG).show()
                val shp = getSharedPreferences("save", MODE_PRIVATE)
                val editor = shp.edit()
                editor.putString("isConnected", "")
                editor.apply()
                editor.remove("jwt")
                editor.apply()

                var i = Intent(this, MainActivity::class.java)
                startActivity(i)
                finish()
            }
        }
        drawerLayout.closeDrawer(GravityCompat.START)
        return true;
    }
    private fun replaceFragment(fragment: Fragment){
        val transaction: FragmentTransaction = supportFragmentManager.beginTransaction()
        transaction.replace(R.id.fragment_container, fragment)
        transaction.commit()
    }

    override fun onBackPressed(){
        super.onBackPressed()
        if(drawerLayout.isDrawerOpen(GravityCompat.START)){
            drawerLayout.closeDrawer(GravityCompat.START)
        }else{
            onBackPressedDispatcher.onBackPressed()
        }
    }
}