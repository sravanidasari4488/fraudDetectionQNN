import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Text from '../ui/Text';

export default function TransactionInfoBox({ data, onPress, isLastInGroup = true, isFirstInGroup = true }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'failed':
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getTransactionIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'credit':
      case 'earnings':
        return 'arrow-down-circle';
      case 'debit':
      case 'withdrawal':
        return 'arrow-up-circle';
      default:
        return 'swap-horizontal';
    }
  };

  const getIconColor = (type, status) => {
    // For debit transactions, use deep blue for the up arrow (suggests trust and professionalism)
    if (type === 'debit' || type === 'withdrawal') {
      return '#1E40AF';
    }
    // For other types, use status-based color
    return getStatusColor(status);
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        !isLastInGroup && styles.containerWithBorder,
        isFirstInGroup && styles.firstInGroup,
        isLastInGroup && styles.lastInGroup
      ]} 
      onPress={() => onPress && onPress(data)}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        <View style={[styles.iconContainer, { backgroundColor: getIconColor(data.type, data.status) + '20' }]}>
          <Ionicons 
            name={getTransactionIcon(data.type)} 
            size={20} 
            color={getIconColor(data.type, data.status)} 
          />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.title} numberOfLines={1}>
            {data.title || data.description || 'Transaction'}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {data.subtitle || `${formatDate(data.date)} • ${formatTime(data.date)}`}
          </Text>
        </View>
      </View>
      
      <View style={styles.rightSection}>
        <Text style={[styles.amount, { color: data.type === 'credit' ? '#10B981' : data.type === 'debit' ? '#1E40AF' : '#6B7280' }]} numberOfLines={1}>
          {data.type === 'credit' ? '+' : data.type === 'debit' ? '-' : ''}{formatCurrency(Math.abs(data.amount))}
        </Text>
        <Text style={[styles.status, { color: getStatusColor(data.status) }]} numberOfLines={1}>
          {data.status || 'Completed'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#ffffff',
  },
  containerWithBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  firstInGroup: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  lastInGroup: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 80,
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  status: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});
