import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { theme } from './colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5, MaterialIcons, Entypo } from '@expo/vector-icons';


const STORAGE_KEY="@toDos"
const STORAGE_TAB_KEY="@working"
export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [imsitext, setImsiText] = useState("");
  const [toDos, setToDos] = useState({});
  const [complete, setComplete] = useState(false);
  const [edited, setEdited] = useState(false);
  useEffect(() => {
    //어플 시작시    
    getToTab();
    loadToDos();
  },[]);

  const travle = () => {
    setWorking(false)
    saveToTab(false)
  }
  const work = () => {
    setWorking(true)
    saveToTab(true)
  };
  const onChangeText = (payload) => setText(payload);
  const onChangeImsiText = (imsiTxt) => setImsiText(imsiTxt)
  const saveToDos = async(toSave) => {    
    //string으로 변경
    await AsyncStorage.setItem(STORAGE_KEY,JSON.stringify(toSave))
  };

  const saveToTab = async(working) => {   
    //마지막 탭 위치 저장
    await AsyncStorage.setItem(STORAGE_TAB_KEY,JSON.stringify(working))
  };

  const getToTab = async() => {
    const tab = await AsyncStorage.getItem(STORAGE_TAB_KEY)  
    const t = JSON.parse(tab);      
    if(t){
      setWorking(true)
    }else{
      setWorking(false)
    }
    return t;
  }
  const loadToDos = async() => {    
    try{                          
      const s = await AsyncStorage.getItem(STORAGE_KEY)
      s !== null ? setToDos(JSON.parse(s)) : null;
    }catch(e){
      console.log(e);
    }
  }
  const addToDo = async() =>{
    if(text === ""){      
      return
    }
    /* 기존 toDos + 새 toDos 오브젝트로 합치기 */
    //**********************************************************************************************/
    const newToDos = {
      ...toDos,
      [Date.now()]: {text, working, complete, edited},
      //key=Date : value=text,working
    };
    //**********************************************************************************************/


    /*두번째 방법*/
    //**********************************************************************************************/
    // const newToDos = Object.assign({}, toDos, {
    //   [Date.now()]: {text, work:working},
    // });
    //**********************************************************************************************/

   // save to do
   setToDos(newToDos);
   await saveToDos(newToDos);
   setText("");   
  };

  const deleteToDo = (key) => {
    Alert.alert("Delete To Do?", "Are you sure?",[{ text: "Cancel"},{ text: "I'm Sure", onPress:async()=>{
      //삭제 시작
      const newToDos = {...toDos}
      delete newToDos[key]
      setToDos(newToDos);
      await saveToDos(newToDos);
    }},]);
    return;
  };

  const complete_check = async (key) => {
    //할일 완료 표시    
    const newToDos = {...toDos}
    const temp = newToDos[key].complete;

    try{ 

    newToDos[key].complete = !temp //현재 완료 여부의 반대로 저장(토글)

    setToDos(newToDos);
    await saveToDos(newToDos);
    }catch(e){
      console.log(e);
    }

    // Object.keys(toDos).map(todo_key =>    
    //   console.log(toDos[todo_key].complete)
    // )
  }

  const modify = async (props) => {    
    let key = props.key;
    // let new_item = toDos[key];
    // console.log(new_item);
      try{       
        //수정 기능
        const newToDos = {...toDos}
        const temp = newToDos[key].edited;
        newToDos[key].edited = !temp;        
        if(!newToDos[key].edited){ //수정후 연필 버튼 클릭시
          newToDos[key].text = imsitext;     
        }
        setToDos(newToDos);
        await saveToDos(newToDos);
    }catch(e){
        console.log(e);
    }
  }

  // {
  //   Object.keys(toDos).map( key => {
  //       console.log(toDos[key].text);
  //       return <div  key={toDos[key]} >Hey!! {toDos[key].text}</div>
  //   })
  // }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={{...styles.btnText, color: working ? "white":theme.grey}}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travle}>
          <Text style={{...styles.btnText, color: !working ? "white":theme.grey}}>Travel</Text>
        </TouchableOpacity>
      </View>
      <TextInput 
        onSubmitEditing={addToDo} //사용자가 엔터(완료) 버튼을 눌렀을때
        onChangeText={onChangeText} //글자 입력할때
        value={text}
        returnKeyType="done"
        placeholder={working ? "Add a To Do" : "Where do you want to go?"} 
        style={styles.input}  
      />      
        <ScrollView>
          {Object.keys(toDos).map((key=>            
            toDos[key].working === working ? (
            <View style={styles.toDo} key={key}>
              {/* {<Text  key={toDos[key]} >Hey!! {String(toDos[key].text)}</Text>} */}
              {toDos[key].edited ? <TextInput style={styles.input} onChangeText={onChangeImsiText}></TextInput>  : <Text style={styles.toDoText}>{toDos[key].text}</Text>}
              <View style={styles.toDoIcon}>
                <TouchableOpacity style={styles.check} onPress={ (e) => {modify(props={key})}}>
                  <Entypo name="pencil" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.check} onPress={ (e) => {complete_check(key)}}>                          
                  {toDos[key].complete ? <MaterialIcons name="check-box" size={24} color="white" /> : <MaterialIcons name="check-box-outline-blank" size={24} color="white" />}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteToDo(key)}>
                  <FontAwesome5 name="trash-alt" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>
            ) : null
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
    justifyContent: 'space-between',
    flexDirection:"row",    // 양옆으로 배열되는
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor:"white",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo:{
    backgroundColor: theme.toDoBg, 
    marginBottom: 10,
    paddingVertical:20,
    paddingHorizontal:40,
    borderRadius: 15,
    flexDirection:"row",
    alignItems: "center",
    justifyContent:"space-between"
  },
  toDoIcon:{
    flexDirection:"row",
    alignItems: "center"
  },
  toDoText:{
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  check:{
    marginRight:20
  }
});
