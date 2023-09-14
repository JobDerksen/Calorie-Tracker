/* eslint-disable prettier/prettier,no-trailing-spaces,react-hooks/exhaustive-deps */
/*
Author - Job Derksen
Date created - 06/06/2022
Class used to add new food and stored calories and protein per gram
*/

import React, {useEffect, useState} from 'react';
import {
    Alert,
    Dimensions, FlatList,
    Image, Keyboard,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';
import Delete from './Delete';
import ModalPopup from './ModalPopup';

let foodArray = [];
let mealArray = [];

const Item = ({ title }) => (
    <View>
        <Text style={styles.flatListText}> {title} </Text>
    </View>
);

const InputFood = () => {

    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState(foodArray);
    const [visibleDel, setVisibleDel] = useState(false);
    const [swapDisplay, setSwapDisplay] = React.useState(1);
    const [itemToDel,setItemToDel] = React.useState(false);
    const [inputData,setInputData] = React.useState({
        name: '',
        calories: '',
        protein: '',
        weight: '',
        mealWeight: '',
        nameError: '',
        caloriesError: '',
        weightError: '',
        proteinError: '',
        scanError: '',
        mealWeightError: '',
    });

    const getData = async () => {
        try {
            let data = JSON.parse(await AsyncStorage.getItem('foodItem'));
            if (data != null){
                foodArray = JSON.parse(await AsyncStorage.getItem('foodItem'));
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getData().then();
    });

    const setItemToRemove = (item) => {
        setItemToDel(item);
        setVisibleDel(true);
    };

    const RenderDelete = () => {
        return (
            <View stlye={{flex:1}}>
                <ModalPopup visible={visibleDel} style={'YN'}>
                    <Delete itemToDel={itemToDel} array={mealArray} visibleDel={visibleDel} onVisableChange={setVisibleDel}/>
                </ModalPopup>
            </View>
        );
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => setItemToRemove(item)}>
            <View style={styles.rowContainerForFlatList}>
                <Item title={item.label} />
                <Item title={Math.round((item.value[0] + Number.EPSILON) * 100) / 100}/>
                <Item title={Math.round((item.value[1] + Number.EPSILON) * 100) / 100}/>
            </View>
        </TouchableOpacity>
    );

    const foodData = {
        id: inputData.name,
        label: inputData.name,
        value: [inputData.calories / inputData.weight, inputData.protein / inputData.weight, inputData.name],
    };

    const findTotalMacro = (type) => {
        let totalProt = 0;
        let totalCal = 0;
        mealArray.forEach((food) => {
            totalProt = totalProt + food.value[1];
            totalCal = totalCal + food.value[0];
        });

        if (type === 'cal'){
            return Math.round(totalCal);
        } else {
            return Math.round(totalProt);
        }
    };

    const submit = async () => {
        let found = false;
        if (inputData.name !== '' && inputData.calories !== ''  && inputData.protein !== '' && inputData.weight !== ''){
            if (foodArray != null) {
                foodArray.forEach((item)=>{
                    if (inputData.name === item.id){
                        found = true;
                    }
                });
            }
            if (!found){
                foodArray.push(foodData);
                setInputData({...inputData,name: '', calories: '', protein: '', weight: ''});

                try {
                    await AsyncStorage.setItem('foodItem', JSON.stringify(foodArray));
                } catch (error) {
                    console.log(error);
                }

                Alert.alert('Food added successfully', 'well done');
            } else {
                Alert.alert('Item Already Exists', 'Please delete or name it something else');
            }
        } else {
            Alert.alert('Please Fill Out all Fields', "don't be a cunt");
        }
    };

    const submitMealItem  = async () => {
        let today = new Date();
        if (value != null && inputData.weight !== ''){
            setInputData({...inputData,name: '', calories: '', protein: '', weight: ''});
                const mealArrayItem = {
                    id: value[2] + (mealArray.length * (today.getHours() + today.getMinutes() + today.getSeconds())).toString(),
                    label: value[2],
                    value: [inputData.weight * value[0], inputData.weight * value[1]],
                };
                mealArray.push(mealArrayItem);
                setInputData({...inputData, weight: ''});
                setValue(null);

        }
    };

    const submitMeal = async () => {
        let found = false;
        if (inputData.name !== '' && mealArray.length > 0 && inputData.mealWeight !== '') {
            foodArray.forEach((item)=>{
                if (inputData.name === item.id){
                    found = true;
                }
            });
            if (!found){
                const meal = {
                    id: inputData.name,
                    label: inputData.name,
                    value: [findTotalMacro('cal') / inputData.mealWeight, findTotalMacro('pro') / inputData.mealWeight, inputData.name, mealArray],
                };
                foodArray.push(meal);
                setInputData({...inputData,name: '', calories: '', protein: '', weight: ''});
                setInputData({...inputData, mealWeight: ''});
                mealArray = [];
                setValue(null);

                try {
                    await AsyncStorage.setItem('foodItem', JSON.stringify(foodArray));
                } catch (error) {
                    console.log(error);
                }

                Alert.alert('Food added successfully', 'well done');
            } else {
                Alert.alert('Item Already Exists', 'Please delete or name it something else');
            }
        }
    };

    const validation = (type) => {
        let errorType = type + 'Error';
        if (inputData[type] === ''){
            setInputData({...inputData, [errorType]:'The ' + type + ' field cannot be empty'});
        } else {
            setInputData({...inputData, [errorType]:''});
        }
    };

    const onBarCodeRead = (scanResult) => {
        console.log(scanResult.data);
        if (scanResult.data != null) {
            fetch('https://world.openfoodfacts.org/api/v0/product/' + scanResult.data + '.json')
                .then((response) => response.json())
                .then((json) => {
                    //check if product exists in database
                    if (json.status_verbose === 'product found') {
                     //product exists and is food and has kcal per 100g and protein per 100g
                     if (json.product.nutriments['energy-kcal_100g'] != null && json.product.nutriments.proteins_100g != null) {
                         setInputData({...inputData,
                             name: json.product.product_name,
                             calories: json.product.nutriments['energy-kcal_100g'].toString(),
                             protein: json.product.nutriments.proteins_100g.toString(),
                             weight: '100',
                             scanError: ''});
                    }
                     //product exists and is food but has kj not kcal
                     else if (json.product.nutriments['energy-kj_100g'] != null && json.product.nutriments.proteins_100g != null){
                         setInputData({...inputData,
                             name: json.product.product_name,
                             calories: (Math.round((json.product.nutriments['energy-kj_100g'] / 4.184) * 100) / 100).toString(),
                             protein: json.product.nutriments.proteins_100g.toString(),
                             weight: '100',
                             scanError: ''});
                     }
                     // if protein info does not exist for kcal
                     else if (json.product.nutriments['energy-kcal_100g'] != null) {
                         setInputData({...inputData,
                             name: json.product.product_name,
                             calories: json.product.nutriments['energy-kcal_100g'].toString(),
                             protein: '',
                             weight: '100',
                             scanError: ''});
                    }
                     // if protein info does not exist for kj
                     else if (json.product.nutriments['energy-kj_100g'] != null){
                        setInputData({...inputData,
                            name: json.product.product_name,
                            calories: (Math.round((json.product.nutriments['energy-kj_100g'] / 4.184) * 100) / 100).toString(),
                            protein: '',
                            weight: '100',
                            scanError: ''});
                    }
                     // if protein only exists
                     else if (json.product.nutriments.proteins_100g != null) {
                         setInputData({...inputData,
                             name: json.product.product_name,
                             calories: json.product.nutriments['energy-kcal_100g'].toString(),
                             protein: json.product.nutriments.proteins_100g.toString(),
                             weight: '100',
                             scanError: ''});
                     }
                     else {
                         setInputData({...inputData,
                             name: '',
                             calories: '',
                             protein: '',
                             weight: '',
                             scanError: 'This is not a consumable food item'});
                     }
                    }
                     else {
                        setInputData({...inputData,
                            name: '',
                            calories: '',
                            protein: '',
                            weight: '',
                            scanError: 'Database does not provide sufficient data for this item'});
                    }
                })
                .catch((error) => console.error(error))
                .finally(() => setSwapDisplay(1));
        }

    };

    const [torch, setTorch] = React.useState(RNCamera.Constants.FlashMode.off);

    const toggleTorch = () => {
        let tstate = torch;
        if (tstate === RNCamera.Constants.FlashMode.off){
            tstate = RNCamera.Constants.FlashMode.torch;
        } else {
            tstate = RNCamera.Constants.FlashMode.off;
        }
        setTorch(tstate);
    };

    const addMealBtn = () => {
        getData().then(setSwapDisplay(3));
        setItems(foodArray);
        setInputData({...inputData,name: '', calories: '', protein: '', weight: ''});
        setValue(null);

    };

    if (swapDisplay === 1){
        return (
            <View style={styles.container}>

                <View>
                    <Text style={styles.errorText}>{inputData.scanError}</Text>
                    <TouchableOpacity onPress={()=>setSwapDisplay(2)}>
                        <View  style={styles.scanButton} >
                            <Text style={styles.buttonText}>Scan Barcode</Text>
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.errorText}>{inputData.nameError}</Text>
                    <SafeAreaView>
                        {/* Name Input */}
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
                        {/* Weight Input */}
                        <Text style={styles.errorText}>{inputData.weightError}</Text>
                        <TextInput
                            value={inputData.weight}
                            style={styles.input}
                            onChangeText={(weight) => setInputData({...inputData, weight:weight})}
                            placeholder="Enter Grams"
                            keyboardType="numeric"
                            onBlur={()=>validation('weight')}
                        />

                        <View style={{paddingBottom: 40}}>
                            <TouchableOpacity onPress={()=>submit()}>
                                <View  style={styles.button} >
                                    <Text style={styles.buttonText}>Submit</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.heading}>
                            <TouchableOpacity onPress={()=>addMealBtn()}>
                                <View style={{flexDirection: 'row'}}>
                                    <Text style={styles.subHeadingText} > Add a meal </Text>
                                    <Image source={require('./back.png')}
                                           style={{height: 30, width: 30, transform:[{scaleX: -1}] }}
                                           tintColor="#dfdfdf"/>
                                </View>
                            </TouchableOpacity>
                        </View>

                    </SafeAreaView>
                </View>

            </View>
        );
    } else if (swapDisplay === 2) {
        return (
            <View style={stylesBarcode.container}>

                <View style={{width: Dimensions.get('window').width * 0.95, height: Dimensions.get('window').height * 0.74}}>
                    <RNCamera
                        ratio={'16:9'}
                        style={stylesBarcode.preview}
                        type={RNCamera.Constants.Type.back}
                        flashMode={torch}
                        androidCameraPermissionOptions={{
                            title: 'Permission to use camera',
                            message: 'We need your permission to use your camera',
                            buttonPositive: 'Ok',
                            buttonNegative: 'Cancel',
                        }}
                        androidRecordAudioPermissionOptions={{
                            title: 'Permission to use audio recording',
                            message: 'We need your permission to use your audio',
                            buttonPositive: 'Ok',
                            buttonNegative: 'Cancel',
                        }}
                        onBarCodeRead={(data) => onBarCodeRead(data)}

                    />
                </View>

                <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
                    <TouchableOpacity onPressIn={()=>setSwapDisplay(1)}>
                        <View>
                            <Image source={require('./back.png')}
                                   style={{height: 35, width: 35, position:'absolute',right: Dimensions.get('window').width * 0.3, bottom: Dimensions.get('window').height * 0.765}}
                                   tintColor="#dfdfdf"
                            />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity   onPressIn={() => toggleTorch() }>
                        { torch === RNCamera.Constants.FlashMode.off ? (
                            <Image style={{height: 50, width: 50, bottom: 60}} source={require('./FlashOn.png')}/>
                        ) : (
                            <Image style={{height: 50, width: 50, bottom: 60}} source={require('./FlashOff.png')}/>
                        )
                        }
                    </TouchableOpacity>
                </View>
            </View>
        );

    } else {
        return (
            <View style={styles.container}>
                <SafeAreaView>
                    <TouchableOpacity onPressIn={()=>setSwapDisplay(1)}>
                        <View>
                            <Image source={require('./back.png')}
                                   style={{height: 35, width: 35, position:'absolute',left: -26, top: -53}}
                                   tintColor="#dfdfdf"
                            />
                        </View>
                    </TouchableOpacity>

                    <TextInput
                        value={inputData.name.toString()}
                        style={styles.input}
                        onChangeText={(name) => setInputData({...inputData, name:name})}
                        placeholder="Enter meal name"
                        placeholderTextColor="#dfdfdf"
                        onBlur={()=>validation('weight')}
                        maxLength={24}
                    />

                    {/*DropDown menu*/}
                    <View style={{paddingTop: 10, paddingBottom: 5}}>
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
                            onOpen={() => Keyboard.dismiss()}

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

                    <TouchableOpacity onPress={()=>submitMealItem()}>
                        <View  style={styles.button} >
                            <Text style={styles.buttonText}>Add to meal</Text>
                        </View>
                    </TouchableOpacity>

                </SafeAreaView>

                <View style={{flex:0.6, padding: 20, paddingHorizontal: 10, paddingTop: 5, paddingBottom: 5}}>
                    <View style={styles.listHeading}>
                        <Text style={styles.listHeadingText}>Food Item | Calories: {findTotalMacro('cal')} | Protein: {findTotalMacro('pro')}</Text>
                    </View>
                    <FlatList
                        style={styles.flatListView}
                        data={mealArray}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                    />


                </View>

                <Text style={styles.errorText}>{inputData.mealWeightError}</Text>
                <TextInput
                    value={inputData.mealWeight.toString()}
                    style={styles.input}
                    onChangeText={(weight) => setInputData({...inputData, mealWeight:weight})}
                    placeholder="Enter Total meal weight cooked"
                    keyboardType="numeric"
                    placeholderTextColor="#dfdfdf"
                    onBlur={()=>validation('mealWeight')}
                />

                <TouchableOpacity onPress={()=>submitMeal()}>
                    <View  style={{paddingBottom:0, paddingTop:0, padding:10}} >
                        <Text style={styles.buttonText}>Submit</Text>
                    </View>
                </TouchableOpacity>

                <RenderDelete/>

            </View>
        );
    }

};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: Dimensions.get('window').width * 0.8,
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    input: {
        height: 36,
        margin: 12,
        borderWidth: 1,
        padding: 10,
    },
    heading: {
        alignSelf: 'center',
    },
    headingText: {
        fontSize:25,
    },
    errorText:{
        marginLeft: 10,
        color: 'red',
    },
    title: {
        fontSize: 20,
    },
    button:{
        padding: 10,
    },
    scanButton:{
        padding: 30,
        paddingBottom: 0,
        paddingTop: 0,
    },
    buttonText:{
        fontSize: 15,
        padding: 5,
        backgroundColor: '#A7C7E7',
        borderRadius: 2,
        color: 'white',
        textAlign: 'center',
    },
    rowContainerForFlatList: {
        flexDirection: 'row',
    },
    subHeadingText: {
        fontSize:22,
        textAlign: 'center',
        color: '#dfdfdf',
        fontStyle: 'italic',
        textDecorationLine: 'underline',
    },
    flatListText: {
        color: 'white',
        paddingLeft: 6,
        paddingTop: 4,
        fontSize: 14,
        fontWeight: '300',
    },
    listHeading: {
        backgroundColor: '#757575',
        borderBottomColor: '#333333',
        borderBottomWidth: 1.5,

    },
    listHeadingText: {
        color: '#edebeb',
        marginLeft: 10,
        fontSize: 14,
        fontWeight: '400',
    },
    buttonYN:{
        padding: 15,
        paddingTop: 20,
    },
    buttonTextYN:{
        fontSize: 18,
        padding: 5,
        backgroundColor: '#A7C7E7',
        borderRadius: 2,
        color: 'white',
        paddingHorizontal: 20,
    },
    textOnYNPopup: {
        fontSize: 15,
        textAlign: 'center',
        color: 'white',
        paddingTop: 10,
    },
    flatListView: {
        backgroundColor: '#757575',
    },
});

const stylesBarcode = StyleSheet.create({
    container: {
        flex: 1,

    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        overflow: 'hidden',
        bottom: Dimensions.get('window').height * 0.015,
    },
});


export default InputFood;
