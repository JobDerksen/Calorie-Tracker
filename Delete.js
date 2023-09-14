/* eslint-disable prettier/prettier,no-trailing-spaces,react-hooks/exhaustive-deps */
/*
Author - Job Derksen
Date created - 19/08/2022
*/
import React, {useCallback} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Delete = ({itemToDel, array, uuid, visibleDel, onVisableChange, onUpdate, update}) => {

    const removeItem = async () => {
        const indexOfObject = array.findIndex(object => {
            return object.id === itemToDel.id;
        });
        array.splice(indexOfObject,1);

        if (uuid != null){
            try {
                await AsyncStorage.setItem(uuid, JSON.stringify(array));
            } catch (error) {
                console.log(error);
            }
        }
        handleInputChange();
    };

    const handleInputChange = useCallback(event => {
        onVisableChange(visibleDel = false);
        if (onUpdate != null){
            onUpdate(update = false);
        }
    }, [onVisableChange]);

    return (
        <View style={styles.container}>
            <View style={{alignItems: 'center'}}>
                <View style={styles.bluetooth}>
                    <View>
                        <Text style={styles.textOnYNPopup}>Delete {itemToDel.label}? </Text>
                        <View style={styles.rowContainer}>
                            <TouchableOpacity onPress={() => removeItem()}>
                                <View  style={styles.buttonYN} >
                                    <Text style={styles.buttonTextYN}>Yes</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() =>  handleInputChange()}>
                                <View  style={styles.buttonYN} >
                                    <Text style={styles.buttonTextYN}>No</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bluetooth:{
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

    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
});

export default Delete;
