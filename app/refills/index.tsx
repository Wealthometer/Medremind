import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import {
  getMedications,
  Medication,
  updateMedication,
} from "../../utils/storage";
import { scheduleRefillReminder } from "../../utils/notifications";

export default function RefillTrackerScreen() {
  const router = useRouter();
  const [medications, setMedications] = useState<Medication[]>([]);

  const loadMedications = useCallback(async () => {
    try {
      const allMedications = await getMedications();
      setMedications(allMedications);
    } catch (error) {
      console.error("Error loading medications:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMedications();
    }, [loadMedications])
  );

  const handleRefill = async (medication: Medication) => {
    try {
      const updatedMedication = {
        ...medication,
        currentSupply: medication.totalSupply,
        lastRefillDate: new Date().toISOString(),
      };

      await updateMedication(updatedMedication);
      await loadMedications();

      Alert.alert(
        "Refill Recorded",
        `${medication.name} has been refilled to ${medication.totalSupply} units.`
      );
    } catch (error) {
      console.error("Error recording refill:", error);
      Alert.alert("Error", "Failed to record refill. Please try again.");
    }
  };

  const getSupplyStatus = (medication: Medication) => {
    const percentage =
      (medication.currentSupply / medication.totalSupply) * 100;
    if (percentage <= medication.refillAt) {
      return {
        status: "Low",
        color: "#F44336",
        backgroundColor: "#FFEBEE",
      };
    } else if (percentage <= 50) {
      return {
        status: "Medium",
        color: "#FF9800",
        backgroundColor: "#FFF3E0",
      };
    } else {
      return {
        status: "Good",
        color: "#4CAF50",
        backgroundColor: "#E8F5E9",
      };
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1a8e2d", "#146922"]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color="#1a8e2d" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Refill Tracker</Text>
        </View>

        <ScrollView
          style={styles.medicationsContainer}
          showsVerticalScrollIndicator={false}
        >
          {medications.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="medical-outline" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No medications to track</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push("/medications/add")}
              >
                <Text style={styles.addButtonText}>Add Medication</Text>
              </TouchableOpacity>
            </View>
          ) : (
            medications.map((medication) => {
              const supplyStatus = getSupplyStatus(medication);
              const supplyPercentage =
                (medication.currentSupply / medication.totalSupply) * 100;

              return (
                <View key={medication.id} style={styles.medicationCard}>
                  <View style={styles.medicationHeader}>
                    <View
                      style={[
                        styles.medicationColor,
                        { backgroundColor: medication.color },
                      ]}
                    />
                    <View style={styles.medicationInfo}>
                      <Text style={styles.medicationName}>
                        {medication.name}
                      </Text>
                      <Text style={styles.medicationDosage}>
                        {medication.dosage}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: supplyStatus.backgroundColor },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: supplyStatus.color },
                        ]}
                      >
                        {supplyStatus.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.supplyContainer}>
                    <View style={styles.supplyInfo}>
                      <Text style={styles.supplyLabel}>Current Supply</Text>
                      <Text style={styles.supplyValue}>
                        {medication.currentSupply} units
                      </Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                      <View style={styles.progressBarBackground}>
                        <View
                          style={[
                            styles.progressBar,
                            {
                              width: `${supplyPercentage}%`,
                              backgroundColor: supplyStatus.color,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {Math.round(supplyPercentage)}%
                      </Text>
                    </View>
                    <View style={styles.refillInfo}>
                      <Text style={styles.refillLabel}>
                        Refill at: {medication.refillAt}%
                      </Text>
                      {medication.lastRefillDate && (
                        <Text style={styles.lastRefillDate}>
                          Last refill:{" "}
                          {new Date(
                            medication.lastRefillDate
                          ).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.refillButton,
                      {
                        backgroundColor:
                          supplyPercentage < 100 ? medication.color : "#e0e0e0",
                      },
                    ]}
                    onPress={() => handleRefill(medication)}
                    disabled={supplyPercentage >= 100}
                  >
                    <Text style={styles.refillButtonText}>Record Refill</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 140 : 120,
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    zIndex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    marginLeft: 15,
  },
  medicationsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  medicationCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  medicationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  medicationColor: {
    width: 12,
    height: 40,
    borderRadius: 6,
    marginRight: 16,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  medicationDosage: {
    fontSize: 14,
    color: "#666",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  supplyContainer: {
    marginBottom: 16,
  },
  supplyInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  supplyLabel: {
    fontSize: 14,
    color: "#666",
  },
  supplyValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    textAlign: "right",
  },
  refillInfo: {
    marginTop: 8,
  },
  refillLabel: {
    fontSize: 12,
    color: "#666",
  },
  lastRefillDate: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  refillButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  refillButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    padding: 30,
    backgroundColor: "white",
    borderRadius: 16,
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: "#1a8e2d",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addButtonText: {
    color: "white",
    fontWeight: "600",
  },
});
