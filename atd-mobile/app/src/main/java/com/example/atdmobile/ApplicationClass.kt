import android.app.Application
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

import com.onesignal.OneSignal
import com.onesignal.debug.LogLevel

const val ONESIGNAL_APP_ID = "26051d2b-f78c-4da0-96ac-7b81d74febdd"

class ApplicationClass : Application() {
        override fun onCreate() {
                super.onCreate()
                // Verbose Logging set to help debug issues, remove before releasing your app.
                OneSignal.Debug.logLevel = LogLevel.VERBOSE

                // OneSignal Initialization
                OneSignal.initWithContext(this, ONESIGNAL_APP_ID)

                // requestPermission will show the native Android notification permission prompt.
                // NOTE: It's recommended to use a OneSignal In-App Message to prompt instead.
                CoroutineScope(Dispatchers.IO).launch {
                        OneSignal.Notifications.requestPermission(true)
                }
        }
}