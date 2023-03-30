import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert, Platform } from 'react-native';
import { theme } from './color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Fontisto } from '@expo/vector-icons';
import { Checkbox } from 'react-native-paper';
import * as React from 'react';

const STORAGE_KEY = "@toDos";

export default function App() {
  const [working, setWorking] = useState(true);
  const travle = () => setWorking(false);
  const work = () => setWorking(true);
  const [checked, setChecked] = React.useState(false);

  //todolist obj
  const [toDos, setToDos] = useState({});

  //텍스트인풋
  const [text, setText] = useState("");
  const onChangeText = (payload) => setText(payload);

  //async스토리지
  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave)) //Object to String
  }
  const loadToDos = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY)
      //String to Object
      setToDos(JSON.parse(s))

    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    loadToDos();
  }, [])

  //Submit
  const addToDo = async () => {
    if (text === "") {
      return
    }
    //todo 저장 Object.assign 오브젝트 합치기
    const newToDos = { ...toDos, [Date.now()]: { text, working, checked} }
    setToDos(newToDos)

    //스토리지에 저장
    saveToDos(newToDos)

    //텍스트 초기화
    setText("")
  }

  //Todo 삭제
  //삭제하기 위해 원래 오브젝트 복제하고 삭제하고 set
  const deleteToDo = (key) => {
    if(Platform.OS === "web"){
      const ok = confirm("delete To do?");
      if(ok){
        const newToDos = { ...toDos }
        delete newToDos[key]
        setToDos(newToDos)
        saveToDos(newToDos)
      }
    }
    Alert.alert("Delete To Do", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "I'm Sure", onPress: async () => {
          const newToDos = { ...toDos }
          delete newToDos[key]
          setToDos(newToDos)
          await saveToDos(newToDos)
        }
      }
    ]);
  }

  //Todo 체크
  const checkToDo = async (key) => {
    const newToDos = { ...toDos }
    const temp = newToDos[key].checked

    newToDos[key].checked = !temp

    setToDos(newToDos)
    await saveToDos(newToDos)
  }

  console.log()
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={{ ...styles.btnText, color: working ? "white" : theme.grey }}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travle}>
          <Text style={{ ...styles.btnText, color: working ? theme.grey : "white" }}>Travel</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        returnKeyType='done'
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        placeholder={working ? "Add a To Do" : "어디로 여행갈까?"}
        style={styles.input}>
      </TextInput>

      <ScrollView>
        {
          Object.keys(toDos).map((key) => (
            toDos[key].working === working ?
              <View style={styles.toDo} key={key}>
                <Text style={{...styles.toDoText, 
                  textDecorationLine: toDos[key].checked? 'line-through' : null,
                  color : toDos[key].checked ? 'green': 'white'}} >
                  {toDos[key].text}
                </Text>

                <View style={styles.btnView}>
                  <Checkbox key = {key}
                    status={toDos[key].checked ? 'checked' : 'unchecked'}
                    onPress={() => {
                      checkToDo(key);
                    }}
                    color="green"
                  />

                  <TouchableOpacity onPress={() => deleteToDo(key)}>
                    <Fontisto name="trash" size={18} color="white" />
                  </TouchableOpacity>
                </View>

              </View>
              : null
          ))}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100
  },
  btnText: {
    fontSize: 44,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 20,
    fontSize: 18,
    marginBottom: 15,
  },
  toDo: {
    flex:1,
    backgroundColor: theme.grey,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toDoText: {
    flex:0.7,
    fontSize: 16,
    fontWeight: "500",
  },
  btnView:{
    flex:0.3,
    flexDirection:"row",
    alignItems:'center',
    justifyContent:'space-around',
  },
});