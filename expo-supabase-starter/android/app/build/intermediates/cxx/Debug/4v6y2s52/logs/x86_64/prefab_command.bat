@echo off
"C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.14.7-hotspot\\bin\\java" ^
  --class-path ^
  "C:\\Users\\Admin\\.gradle\\caches\\modules-2\\files-2.1\\com.google.prefab\\cli\\2.1.0\\aa32fec809c44fa531f01dcfb739b5b3304d3050\\cli-2.1.0-all.jar" ^
  com.google.prefab.cli.AppKt ^
  --build-system ^
  cmake ^
  --platform ^
  android ^
  --abi ^
  x86_64 ^
  --os-version ^
  24 ^
  --stl ^
  c++_shared ^
  --ndk-version ^
  26 ^
  --output ^
  "C:\\Users\\Admin\\AppData\\Local\\Temp\\agp-prefab-staging6529424787549540439\\staged-cli-output" ^
  "C:\\Users\\Admin\\.gradle\\caches\\8.10.2\\transforms\\d1ab2155b539508f564b7247055e2db0\\transformed\\react-android-0.76.7-debug\\prefab" ^
  "C:\\Users\\Admin\\myprogect\\expo-supabase-starter\\android\\app\\build\\intermediates\\cxx\\refs\\react-native-reanimated\\3j1s93a1" ^
  "C:\\Users\\Admin\\.gradle\\caches\\8.10.2\\transforms\\3a020dac8f88926bf9da4884aa08cf49\\transformed\\hermes-android-0.76.7-debug\\prefab" ^
  "C:\\Users\\Admin\\.gradle\\caches\\8.10.2\\transforms\\14479106fc9c285034fe5188965917a6\\transformed\\fbjni-0.6.0\\prefab"
