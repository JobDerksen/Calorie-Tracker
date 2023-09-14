/* eslint-disable prettier/prettier,no-trailing-spaces,react-hooks/exhaustive-deps */
/*
Author - Job Derksen
Date created - 06/06/2022
Class adds foods either from the input food class with its weight to get calories and protein for portion
or adds one off foods, things such as beers or restaurant meals or if too lazy to input a food and weigh it out
*/

import React, {useEffect, useState} from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    View,
    Alert,
    Dimensions,
    SafeAreaView,
    TouchableOpacity, Image, Keyboard,
} from 'react-native';

import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {foodArray} from './App';

let totalsFoodArray = [];

const getData = async () => {
    try {
        let _TEMPtotalsFoodArray = JSON.parse(await AsyncStorage.getItem('totalFoodArr'));
        if (_TEMPtotalsFoodArray !== null){
            totalsFoodArray = _TEMPtotalsFoodArray;
        }
    } catch (error) {
        console.log(error);
    }
};

const AddFood = () => {

    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState(foodArray);
    const [swapDisplay, setSwapDisplay] = useState(true);
    /*
    * states for food info the weight is only used for adding food which comes from the InputFood class the
    *  other sates are used for one off items
    */
    const [inputData,setInputData] = React.useState({
        weight: '',
        weightError: '',

        name: '',
        calories: '',
        protein: '',
        caloriesError: '',
        proteinError: '',
    });


    useEffect(() => {
        getData().then();
    });

    //validation method will just print out error message for certain input boxes
    const validation = (type) => {
        let errorType = type + 'Error';
        if (inputData[type] === ''){
            setInputData({...inputData, [errorType]:'The ' + type + ' field cannot be empty'});
        } else {
            setInputData({...inputData, [errorType]:''});
        }
    };

    //submit function for either types of adding foods, async as its using async storage to store added food array
    const submit = async () => {
        let today = new Date();

        if (swapDisplay) {
            if (inputData.weight !== '' && value != null) {
                const foodData = {
                    id: value[2] + (totalsFoodArray.length * (today.getHours() + today.getMinutes() + today.getSeconds())).toString(),
                    label: value[2],
                    value: [inputData.weight * value[0], inputData.weight * value[1]],
                };
                totalsFoodArray.push(foodData);

                setInputData({...inputData, weight: ''});
                setValue(null);

            } else {
                Alert.alert('Enter weight', 'Dickhead');
            }
        } else {
            if (inputData.name !== '' && inputData.calories !== '' && inputData.protein !== '') {
                const foodData = {
                    id: inputData.name + (totalsFoodArray.length * (today.getHours() + today.getMinutes() + today.getSeconds())).toString(),
                    label: inputData.name,
                    value: [+inputData.calories, +inputData.protein],
                };
                totalsFoodArray.push(foodData);

                setInputData({...inputData, name: '', calories: '', protein: ''});
            } else {
                Alert.alert('Please Fill Out all Fields', "don't be a cunt");
            }
        }
        //once either have been done the totalsFoodArray (array which stored food items eaten in a day) is stored as a JSON
        try {
            await AsyncStorage.setItem('totalFoodArr', JSON.stringify(totalsFoodArray));
        } catch (error) {
            console.log(error);
        }
    };

    const DisplayInfo = () => {
        if (value != null){
            return (
                <View>
                    <Text style={styles.infoText}>Calories: {Math.round(((inputData.weight * value[0]) + Number.EPSILON) * 100) / 100}</Text>
                    <Text style={styles.infoText}>Protein: {Math.round(((inputData.weight * value[1]) + Number.EPSILON) * 100) / 100}</Text>
                </View>
            );
        } else {
            return (
                <View>
                    <Text style={styles.infoText}> Enter weight in grams and food item </Text>
                    <Text style={styles.infoText}> </Text>
                </View>
            );
        }
    };

    const clearValue = () => {
        setSwapDisplay(false);
        setValue(null);
    };


    if (swapDisplay){
        //view for adding existing food
        return (
            <View style={styles.container}>
                <SafeAreaView>
                    {/*DropDown menu*/}
                    <View style={{paddingTop: 30}}>
                        <DropDownPicker
                            placeholder="Select a food item"
                            listMode="FLATLIST"
                            searchable={true}
                            open={open}
                            value={value}
                            items={items}
                            setOpen={setOpen}
                            setValue={setValue}
                            setItems={setItems}
                            maxHeight={300}

                            style={{
                                backgroundColor: '#575757',

                            }}

                            containerStyle={{
                                width: '93%',
                                alignSelf: 'center',
                            }}

                            textStyle={{
                                color: '#dfdfdf',
                            }}

                            searchPlaceholder="Search for food"

                            searchContainerStyle={{
                                borderBottomColor: 'black',
                            }}

                            dropDownContainerStyle={{
                                backgroundColor: '#575757',
                            }}
                            onOpen={() => Keyboard.dismiss()}

                        />
                    </View>
                    <Text style={styles.errorText}>{inputData.weightError}</Text>
                    <TextInput
                        value={inputData.weight.toString()}
                        style={styles.input}
                        onChangeText={(weight) => setInputData({...inputData, weight:weight})}
                        placeholder="Enter Grams"
                        placeholderTextColor="#dfdfdf"
                        keyboardType="numeric"
                        onBlur={()=>validation('weight')}
                    />

                    <TouchableOpacity onPress={()=>submit()}>
                        <View  style={styles.button} >
                            <Text style={styles.buttonText}>Submit</Text>
                        </View>
                    </TouchableOpacity>

                    <DisplayInfo/>
                </SafeAreaView>

                <View style={styles.heading}>
                    <TouchableOpacity onPress={()=>clearValue()}>
                        <View style={{flexDirection: 'row'}}>
                            <Text style={styles.subHeadingText} > Add one off Item </Text>
                            <Image source={require('./back.png')}
                                   style={{height: 30, width: 30, transform:[{scaleX: -1}] }}
                                   tintColor="#dfdfdf"/>
                        </View>
                    </TouchableOpacity>
                </View>

            </View>
        );
    } else {
        //View for one off scrans
        return (
            <View style={styles.container}>
                <TouchableOpacity onPress={()=>setSwapDisplay(true)}>
                    <View>
                        <Image source={require('./back.png')}
                               style={{height: 35, width: 35, position:'absolute',left: -15, top: -52 }}
                               tintColor="#dfdfdf"/>
                    </View>
                </TouchableOpacity>

                <View style={styles.heading2}>
                    <Text style={styles.subHeadingText2}> Add one off food item i.e Alcohol or restaurant item </Text>
                </View>

                {/* Name Input */}
                <Text style={styles.errorText}>{inputData.nameError}</Text>
                <TextInput
                    value={inputData.name}
                    style={styles.input}
                    onChangeText={(foodName) => setInputData({...inputData, name:foodName})}
                    placeholder="Enter Food Name"
                    onBlur={()=>validation('name')}
                    maxLength={24}
                />
                {/* calorie Input */}
                <Text style={styles.errorText}>{inputData.caloriesError}</Text>
                <TextInput
                    value={inputData.calories}
                    style={styles.input}
                    onChangeText={(cal) => setInputData({...inputData, calories:cal})}
                    placeholder="Enter Calories"
                    keyboardType="numeric"
                    onBlur={()=>validation('calories')}
                />
                {/* Protein Input */}
                <Text style={styles.errorText}>{inputData.proteinError}</Text>
                <TextInput
                    value={inputData.protein}
                    style={styles.input}
                    onChangeText={(prot) => setInputData({...inputData, protein:prot})}
                    placeholder="Enter Protein"
                    keyboardType="numeric"
                    onBlur={()=>validation('protein')}
                />
                <TouchableOpacity onPress={()=>submit()}>
                    <View  style={styles.button} >
                        <Text style={styles.buttonText}>Submit</Text>
                    </View>
                </TouchableOpacity>
            </View>

        );
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: Dimensions.get('window').width * 0.80,
    },
    errorText:{
        marginLeft: 12,
        color: 'red',
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,

    },

    heading: {
        alignSelf: 'center',
        paddingTop: 30,
    },
    heading2: {
        alignSelf: 'center',
        paddingBottom: 1,
    },
    headingText: {
        fontSize:25,
        padding: 10,
        paddingHorizontal: 0,
    },
    subHeadingText: {
        fontSize:18,
        textAlign: 'center',
        color: '#dfdfdf',
        fontStyle: 'italic',
        textDecorationLine: 'underline',
    },
    subHeadingText2: {
        fontSize:14,
        textAlign: 'center',
        color: '#dfdfdf',
        fontStyle: 'italic',
        paddingTop: 15,
    },
    button:{
        padding: 12,
        paddingTop: 20,
    },
    buttonText:{
        fontSize: 15,
        padding: 10,
        backgroundColor: '#A7C7E7',
        borderRadius: 2,
        color: 'white',
        textAlign: 'center',
    },
    infoText:{
        paddingTop: 18,
        textAlign: 'center',
        fontSize: 15,
        color: '#dfdfdf',
        fontWeight: 'bold',
    },
});



export default AddFood;
