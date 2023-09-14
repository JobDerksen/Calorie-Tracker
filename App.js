/* eslint-disable prettier/prettier,no-trailing-spaces,react-hooks/exhaustive-deps */
/*
Author - Job Derksen
Date created - 02/06/2022
*/

import React, {useEffect} from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    Image,
    TouchableOpacity,
    Dimensions,
} from 'react-native';

import InputFood from './InputFood';
import AddFood from './AddFood';
import ModalPopup from './ModalPopup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Delete from './Delete';


//Item to help render out flatlist
const Item = ({ title }) => (
    <View>
        <Text style={styles.flatListText}> {title} </Text>
    </View>
);

let totalsFoodArray = [];
let foodArray = [];

const getData = async () => {
    try {
        foodArray = JSON.parse(await AsyncStorage.getItem('foodItem'));
        let _TEMPtotalsFoodArray = JSON.parse(await AsyncStorage.getItem('totalFoodArr'));
        if (_TEMPtotalsFoodArray !== null){
            //await AsyncStorage.removeItem('totalFoodArr');
            totalsFoodArray = _TEMPtotalsFoodArray;
        }
    } catch (error) {
        console.log(error);
    }
};

const App = () => {
    //forces an updates :/ not ideal may need to fix but works
    const [update, isUpdated] = React.useState(false);
    //all popup visibility states
    const [visibleAdd, setVisibleAdd] = React.useState(false);
    const [visibleNew,setVisibleNew] = React.useState(false);
    const [visibleDel,setVisibleDel] = React.useState(false);
    const [visibleSet, setVisibleSet] = React.useState(false);
    const [visibleReset, setVisibleReset] = React.useState(false);

    //sets the state of the object that is to be deleted
    const [itemToDel,setItemToDel] = React.useState(false);

    useEffect(() => {
        getData().then(() => {
            isUpdated(true);
        });
    });

//renders the Item being displayed for flatlist of eaten food
    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => setItemToRemove(item)}>
            <View style={styles.rowContainerForFlatList}>
                <Item title={item.label} />
                <Item title={Math.round((item.value[0] + Number.EPSILON) * 100) / 100}/>
                <Item title={Math.round((item.value[1] + Number.EPSILON) * 100) / 100}/>
            </View>
        </TouchableOpacity>
    );

//sets the item which has been selected to be removed
    const setItemToRemove = (item) => {
        setItemToDel(item);
        setVisibleDel(true);
    };

//returns total protein or calories
    const findTotalMacro = (type) => {
        let totalProt = 0;
        let totalCal = 0;
        totalsFoodArray.forEach((food) => {
            totalProt = totalProt + food.value[1];
            totalCal = totalCal + food.value[0];
        });

          if (type === 'cal'){
              return Math.round(totalCal);
          } else {
              return Math.round(totalProt);
          }
    };

    //reset for new day
    const reset = async () => {
        totalsFoodArray.splice(0,totalsFoodArray.length);
        try {
            await AsyncStorage.setItem('totalFoodArr', JSON.stringify(totalsFoodArray));
        } catch (error) {
            console.log(error);
        }
        setVisibleReset(false);
    };

    const settings = () => {
        getData().then();
        setVisibleSet(true);
    };

    const closeAdd = () => {
        isUpdated(false);
        setVisibleAdd(false);
    };

    const NewFoodPopup = () => {
        return (
            <View>
                <ModalPopup visible={visibleNew} style={'newFood'}>
                    <View style={{alignItems: 'center'}}>
                        <View style={styles.popupHeadingCont}>
                            <Text style={styles.popupHeading}> Enter Food Data </Text>
                            <View style={styles.bluetooth}>
                                <TouchableOpacity onPress={() => setVisibleNew(false)}>
                                    <Image source={require('./X.png')}
                                           style={{height: 30, width: 30}}/>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View>
                            <InputFood/>
                        </View>
                    </View>
                </ModalPopup>
            </View>
        );
    };
    const AddFoodPopup = () => {
        return (
            <View>
                <ModalPopup visible={visibleAdd} style={'addFood'}>
                    <View style={{alignItems: 'center'}}>
                        <View style={styles.popupHeadingCont}>
                            <Text style={styles.popupHeading}> Add Food Items </Text>
                            <View style={styles.bluetooth}>
                                <TouchableOpacity onPress={() => closeAdd()}>
                                    <Image source={require('./X.png')}
                                           style={{height: 30, width: 30}}/>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View>
                            <AddFood/>
                        </View>
                    </View>
                </ModalPopup>
            </View>
        );
    };
    const ResetPopup = () => {
        return (
            <View>
                <ModalPopup visible={visibleReset} style={'YN'}>
                    <View style={{alignItems: 'center'}}>
                        <View style={styles.bluetooth}>
                            <View>
                                <Text style={styles.textOnYNPopup}> Are you sure? </Text>
                                <View style={styles.rowContainer}>

                                    <TouchableOpacity onPress={() => reset()}>
                                        <View  style={styles.buttonYN} >
                                            <Text style={styles.buttonTextYN}>Yes</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={() => setVisibleReset(false)}>
                                        <View  style={styles.buttonYN} >
                                            <Text style={styles.buttonTextYN}>No</Text>
                                        </View>
                                    </TouchableOpacity>

                                </View>
                            </View>
                        </View>
                    </View>
                </ModalPopup>
            </View>
        );
    };

    const DeletePopup = ({keyID, array}) => {
        return (
            <View stlye={{flex:1}}>
                <ModalPopup visible={visibleDel} style={'YN'}>
                    <Delete itemToDel={itemToDel}
                            array={array}
                            uuid={keyID}
                            visibleDel={visibleDel}
                            onVisableChange={setVisibleDel}
                            update={update}
                            onUpdate={isUpdated}/>
                </ModalPopup>
            </View>
        );
    };

    const getMealArray = (type) => {
        let mealFoodArray = [];
        let noneMealArray = [];

        if (foodArray != null) {
            foodArray.forEach((item)=>{
                if (item.value[3] != null) {
                    mealFoodArray.push(item);
                } else {
                    noneMealArray.push(item);
                }
            });
        }


        if (type === 'meal'){
            return mealFoodArray;
        } else {
            return noneMealArray;
        }

    };

    if (!visibleSet) {
        return (
            <View style={styles.container}>
                <View style={styles.heading}>
                    <Text style={styles.title}>Job Derksen Calorie Tracker</Text>
                    <TouchableOpacity onPress={() => settings()}>
                        <Image source={require('./settings.png')}
                               style={{height: 30, width: 30, marginTop: 12}}
                               tintColor="#A7C7E7"/>
                    </TouchableOpacity>
                </View>

                <View style={{paddingTop: 20}}>
                    <View style={styles.totalsView}>
                        <Text style={styles.subHeading} >Total Calories: </Text>
                        <Text style={styles.totalsText}>{findTotalMacro('cal')}</Text>
                    </View>

                    <View style={styles.totalsView}>
                        <Text style={styles.subHeading} >Total Protein: </Text>
                        <Text style={styles.totalsText}>{findTotalMacro('prot')}</Text>
                    </View>
                </View>

                <View style={styles.rowContainer}>
                    <TouchableOpacity onPress={() => setVisibleNew(true)}>
                        <View  style={styles.button} >
                            <Text style={styles.buttonText}>New scran</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setVisibleAdd(true)}>
                        <View  style={styles.button} >
                            <Text style={styles.buttonText}>Add scran</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={{flex:1, padding: 20, paddingHorizontal: 30, paddingTop: 5}}>
                    <View style={styles.listHeading}>
                        <Text style={styles.listHeadingText}>Food Item | Calories | Protein</Text>
                    </View>

                    <FlatList
                        style={styles.flatListView}
                        data={totalsFoodArray}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                    />
                </View>
                <TouchableOpacity onPress={() => setVisibleReset(true)}>
                    <View  style={styles.button} >
                        <Text style={styles.buttonText}> New day new scran </Text>
                    </View>
                </TouchableOpacity>

                <NewFoodPopup/>

                <AddFoodPopup/>

                <DeletePopup keyID={'totalFoodArr'} array={totalsFoodArray}/>

                <ResetPopup/>

            </View>
        );
    } else {
        return (
            <View style={styles.container}>
                <View style={styles.heading}>
                    <TouchableOpacity onPressIn={() => setVisibleSet(false)}>
                        <Image source={require('./back.png')}
                               style={{height: 35, width: 35, position:'absolute',right: Dimensions.get('window').width * 0.22, top: 10 }}
                               tintColor="#333333"/>
                    </TouchableOpacity>
                    <Text style={styles.title}> settings </Text>
                </View>

                <View>
                    <Text style={styles.settingSubHeading} > Select Item you wish to Remove </Text>
                </View>

                <View>
                    <Text style={styles.settingSubHeading} > Food Items </Text>
                </View>

                <View style={{flex:0.7, padding: 10, paddingHorizontal: 20}}>
                    <FlatList
                        style={styles.flatListView}
                        data={getMealArray('noneMeal')}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                    />
                </View>

                <View>
                    <Text style={styles.settingSubHeading} > Meals </Text>
                </View>

                <View style={{flex:0.3, padding: 10, paddingHorizontal: 20}}>
                    <FlatList
                        style={styles.flatListView}
                        data={getMealArray('meal')}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                    />
                </View>
                <DeletePopup keyID={'foodItem'} array={foodArray}/>
            </View>
        );
    }

};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#333333',
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },

    bluetooth:{

    },
    title: {
        fontSize: 25,
        padding: 10,
        textAlign: 'center',
        color: 'white',
        fontWeight: '300',
    },
    heading: {
        backgroundColor: '#575757',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    settingHeading: {
        backgroundColor: '#575757',
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: -10,
        marginLeft: -10,
        width: Dimensions.get('window').width,
    },
    button:{
        padding: 20,
        paddingHorizontal: 40,
    },
    buttonText:{
        fontSize: 18,
        padding: 5,
        backgroundColor: '#A7C7E7',
        borderRadius: 2,
        color: 'white',
        textAlign: 'center',
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
    rowContainerForFlatList: {
        flexDirection: 'row',
    },
    flatListText: {
        color: 'white',
        paddingLeft: 6,
        paddingTop: 8,
        fontSize: 16,
        fontWeight: '300',
    },
    totalsText:{
        backgroundColor: '#0d0d0d',
        padding: 5,
        paddingLeft: 10,
        fontSize: 30,
        fontWeight: 'bold',
        color: 'white',
    },
    totalsView:{
        padding: 5,
        paddingHorizontal: 40,
        paddingVertical: 10,
    },
    subHeading: {
        fontSize: 18,
        padding: 1,
        color: '#edebeb',
        fontWeight: '300',
    },

    settingSubHeading: {
        fontSize: 18,
        textAlign: 'center',
        color: '#edebeb',
        fontWeight: '300',
    },

    flatListView: {
        backgroundColor: '#575757',
    },

    popupHeading: {
        fontSize: 22,
        color: '#edebeb',
        fontWeight: '300',
        paddingLeft: Dimensions.get('window').width * 0.25,
        paddingRight: Dimensions.get('window').width * 0.15,
        paddingTop: 5,
        paddingBottom: 0,
    },
    popupHeadingCont: {
        backgroundColor: '#757575',
        flexDirection: 'row',
        justifyContent: 'center',
        width: Dimensions.get('window').width * 0.95,
        top: -10,
        borderTopEndRadius: 8,
        borderTopStartRadius: 8,
        padding: 10,
    },
    listHeading: {
        backgroundColor: '#575757',
        borderBottomColor: '#333333',
        borderBottomWidth: 1.5,

    },
    listHeadingText: {
        color: '#edebeb',
        marginLeft: 10,
        fontSize: 16,
        fontWeight: '400',
    },
});

export {foodArray};
 export default App;
