import { StyleSheet, View } from "react-native";
import Text from "../ui/Text";
import TransactionInfoBox from "./TransactionInfoBox";

export default function TransactionCard({ data, onItemPress }) {
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Group transactions by timestamp (within 1 minute)
  const groupTransactionsByTime = (transactions) => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    const groups = [];
    let currentGroup = [];
    let lastTimestamp = null;

    // Sort transactions by timestamp first - RECENT FIRST (descending order)
    const sortedTransactions = [...transactions].sort((a, b) => {
      const timestampA = a.timestamp || (a.fullDate ? a.fullDate.getTime() : new Date(a.date || new Date()).getTime());
      const timestampB = b.timestamp || (b.fullDate ? b.fullDate.getTime() : new Date(b.date || new Date()).getTime());
      return timestampB - timestampA; // Changed to descending order for recent first
    });

    console.log('Sorted transactions for grouping:', sortedTransactions.map(t => ({ 
      id: t.id, 
      timestamp: t.timestamp, 
      date: t.date,
      title: t.title 
    })));

    sortedTransactions.forEach((transaction, index) => {
      // Get the timestamp - prefer the timestamp field, fallback to parsing date
      let currentTimestamp;
      if (transaction.timestamp) {
        currentTimestamp = transaction.timestamp;
      } else if (transaction.fullDate) {
        currentTimestamp = transaction.fullDate.getTime();
      } else {
        try {
          currentTimestamp = new Date(transaction.date || new Date()).getTime();
        } catch (error) {
          currentTimestamp = new Date().getTime();
        }
      }

      // Check if this transaction should be in the same group (within 30 seconds)
      if (lastTimestamp === null || Math.abs(currentTimestamp - lastTimestamp) <= 30000) {
        // Same group (within 30 seconds = 30000 milliseconds)
        currentGroup.push(transaction);
      } else {
        // New group - save current group and start new one
        if (currentGroup.length > 0) {
          groups.push([...currentGroup]);
        }
        currentGroup = [transaction];
      }

      lastTimestamp = currentTimestamp;
    });

    // Add the last group
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    console.log('Transaction groups:', groups.map((group, index) => ({
      groupIndex: index,
      groupSize: group.length,
      transactions: group.map(t => ({ id: t.id, title: t.title, timestamp: t.timestamp }))
    })));

    return groups;
  };

  const transactionGroups = groupTransactionsByTime(data.entries);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.year}>{data.year}</Text>
          <Text style={styles.month}>{data.month}</Text>
        </View>
        <Text style={styles.total}>{}</Text>
      </View>
      <View style={styles.transactionsList}>
        {transactionGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.transactionGroup}>
            {group.map((transaction, transactionIndex) => (
              <TransactionInfoBox 
                data={transaction} 
                key={`${groupIndex}-${transactionIndex}`} 
                onPress={onItemPress}
                isLastInGroup={transactionIndex === group.length - 1}
                isFirstInGroup={transactionIndex === 0}
              />
            ))}
            {/* Add spacing between groups except for the last group */}
            {groupIndex < transactionGroups.length - 1 && (
              <View style={styles.groupSeparator}>
                <View style={styles.separatorLine} />
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffffff",   
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    
  },
  headerLeft: {
    flex: 1,
  },
  year: {
    fontSize: 14,
    color: '#000000ff',
    fontWeight: '500',
  },
  month: {
    fontWeight: "bold", 
    fontSize: 16,
    color: '#00000075',
  },
  total: {
    fontWeight: "bold", 
    fontSize: 18,
    color: '#000000ff',
  },
  transactionsList: {
    padding: 8,
  },
  transactionGroup: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 4,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  groupSeparator: {
    height: 16,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  separatorLine: {
    width: 40,
    height: 1,
    backgroundColor: '#e0e0e0',
    borderRadius: 1,
  },
});
