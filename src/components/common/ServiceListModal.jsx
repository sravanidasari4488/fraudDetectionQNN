import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import serviceService from '../../services/serviceService';
import ConfirmModal from '../common/ConfirmModal';
import Text from "../ui/Text";

const { width, height } = Dimensions.get('window');

const ServiceListModal = ({ visible, onClose, userCategory }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [errorModal, setErrorModal] = useState({ visible: false, title: null, message: null });
  const [selectionModal, setSelectionModal] = useState({ visible: false, title: null, message: null, buttons: null });

  useEffect(() => {
    if (visible && userCategory) {
      fetchServices();
    }
  }, [visible, userCategory]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      // Try to use the API first, fallback to dev mode automatically
      const response = await serviceService.getServicesByCategory(userCategory);
      
      if (response.success) {
        setServices(response.data.services);
        setSelectedCategory(response.data.category);
      } else {
        setErrorModal({ visible: true, title: 'Error', message: 'Failed to load services' });
      }
    } catch (error) {
    
      setErrorModal({ visible: true, title: 'Error', message: 'Failed to load services' });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    const category = userCategory;
    if (category === 'Painting') {
      return `₹${price}/sq ft`;
    }
    return `₹${price}`;
  };

  const renderServiceCard = (service) => (
    <View key={service.id} style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <Text style={styles.serviceName}>{service.name}</Text>
        <Text style={styles.servicePrice}>{formatPrice(service.basePrice)}</Text>
      </View>
      
      <Text style={styles.serviceDescription}>{service.description}</Text>
      
      <View style={styles.serviceDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.detailText}>Time: {service.timeEstimate}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="construct-outline" size={16} color="#666" />
          <Text style={styles.detailText}>Materials: {service.materials}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="folder-outline" size={16} color="#666" />
          <Text style={styles.detailText}>Category: {service.category}</Text>
        </View>
      </View>

      <View style={styles.serviceFooter}>
        <View style={styles.subcategoryBadge}>
          <Text style={styles.subcategoryText}>{service.subcategory}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.selectButton}
          onPress={() => {
            setSelectionModal({
              visible: true,
              title: 'Service Selected',
              message: `You offer "${service.name}" service with base rate ${formatPrice(service.basePrice)}. You can request price adjustments based on job complexity.`,
              buttons: [
                { text: 'OK' },
                { text: 'Request Price Change', onPress: () => setErrorModal({ visible: true, title: 'Coming Soon', message: 'Price change request feature will be available soon!' }) }
              ]
            });
          }}
        >
          <Text style={styles.selectButtonText}>Manage</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <ConfirmModal visible={errorModal.visible} title={errorModal.title} message={errorModal.message} onRequestClose={() => setErrorModal({ visible: false })} />
      <ConfirmModal visible={selectionModal.visible} title={selectionModal.title} message={selectionModal.message} buttons={selectionModal.buttons} onRequestClose={() => setSelectionModal({ visible: false })} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{selectedCategory} Services</Text>
            <Text style={styles.headerSubtitle}>
              {services.length} services available
            </Text>
          </View>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4ab9cf" />
            <Text style={styles.loadingText}>Loading services...</Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              {services.length > 0 ? (
                <>
                  <View style={styles.infoBox}>
                    <Ionicons name="information-circle" size={20} color="#4ab9cf" />
                    <Text style={styles.infoText}>
                      These are your service offerings. Base rates are shown - you can request price adjustments for specific jobs based on complexity and requirements.
                    </Text>
                  </View>
                  
                  {services.map(renderServiceCard)}
                </>
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="construct-outline" size={60} color="#ccc" />
                  <Text style={styles.emptyTitle}>No Services Available</Text>
                  <Text style={styles.emptySubtitle}>
                    No services found for {selectedCategory} category
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  closeButton: {
    padding: 5,
  },
  headerContent: {
    flex: 1,
    marginLeft: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e7f3ff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4ab9cf',
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  serviceName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginRight: 10,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4ab9cf',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  serviceDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subcategoryBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subcategoryText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  selectButton: {
    backgroundColor: '#4ab9cf',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default ServiceListModal;
