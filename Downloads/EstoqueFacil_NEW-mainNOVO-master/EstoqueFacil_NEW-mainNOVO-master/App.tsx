import React, { useState, useEffect, useCallback } from 'react';
import { Product, Person, OutputLog, View, User } from './types';
import Navbar from './components/Navbar';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import PersonList from './components/PersonList';
import PersonForm from './components/PersonForm';
import OutputForm from './components/OutputForm';
import OutputLogList from './components/OutputLogList';
import Modal from './components/Modal';
import ConfirmationDialog from './components/ConfirmationDialog';
import DashboardView from './components/DashboardView';
import AuthView from './components/AuthView'; // New component
import UserManagementView from './components/UserManagementView'; // New component
import BulkImportView from './components/BulkImportView'; // Bulk CSV import
import { PlusIcon } from './components/icons';
import { BTN_PRIMARY_FLEX } from './components/styles';
import {
  initDB,
  getProductsDB, addProductDB, updateProductDB, deleteProductDB,
  getPeopleDB, addPersonDB, updatePersonDB, deletePersonDB,
  getOutputLogsDB, recordProductOutputDB,
  addUserDB, getUsersDB, getUserByUsernameDB, deleteUserDB // User DB functions
} from './db';
import { supabase } from './supabaseClient';
import {
  fetchProducts as fetchProductsSb,
  upsertProduct as upsertProductSb, // Changed from insertProduct as insertProductSb
  updateProduct as updateProductSb,
  deleteProduct as deleteProductSb,
  fetchPeople as fetchPeopleSb,
  insertPerson as insertPersonSb,
  updatePerson as updatePersonSb,
  deletePerson as deletePersonSb,
  fetchOutputLogs as fetchOutputLogsSb,
  recordOutput as recordOutputSb,
  signInWithEmail,
  signUpWithEmail,
  signOut
} from './services/supabase';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.Dashboard);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [outputLogs, setOutputLogs] = useState<OutputLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false); // For adding users
  // Editing users is out of scope for now to keep it simple

  const [isOutputModalOpen, setIsOutputModalOpen] = useState(false);

  const [itemToDelete, setItemToDelete] = useState<{ type: 'product' | 'person' | 'user', id: string } | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  const isSupabaseConfigured = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

  const [isDark, setIsDark] = useState<boolean>(() => {
    try { return localStorage.getItem('theme') === 'dark'; } catch { return false; }
  });

  useEffect(() => {
    try {
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('bg-neutral-dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('bg-neutral-dark');
        localStorage.setItem('theme', 'light');
      }
    } catch { }
  }, [isDark]);

  // Initialize DB and load initial data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setDbError(null);
        const isProd = import.meta.env.PROD;

        if (isSupabaseConfigured) {
          const { data } = await supabase.auth.getUser();
          if (data.user) {
            setCurrentUser({ id: data.user.id, username: data.user.email || 'user' });
            await fetchAllData();
          }
        } else {
          // Em produção (Vercel), não devemos usar banco local inseguro silenciosamente
          if (isProd) {
            console.warn("Supabase credentials missing in production build.");
            // Opcional: setDbError("Configuração de Produção Incompleta: Chaves do Supabase não encontradas.");
            // Por enquanto, permitimos o fallback mas com o aviso no console, 
            // pois o AuthView já avisa sobre senhas inseguras se não for Supabase.
          }
          await initDB();
          const loggedInUser = sessionStorage.getItem('currentUser');
          if (loggedInUser) {
            const parsedUser = JSON.parse(loggedInUser);
            setCurrentUser(parsedUser);
            await fetchAllData();
          }
        }
      } catch (error: any) {
        console.error("Failed to initialize app:", error);
        setDbError(isSupabaseConfigured ? `Falha ao conectar no Supabase: ${error.message || 'Erro desconhecido'}` : `Falha ao inicializar o banco de dados: ${error.message || 'Erro desconhecido'}`);
      } finally {
        setIsLoading(false);
      }
    };
    initializeApp();
  }, []);

  // Fetch all data if a user is logged in
  useEffect(() => {
    if (currentUser) {
      fetchAllData();
    } else {
      // Clear data if no user is logged in (or on logout)
      setProducts([]);
      setPeople([]);
      setOutputLogs([]);
      setUsers([]);
      setActiveView(View.Dashboard); // Reset to a default view or handle appropriately
    }
  }, [currentUser]);


  const fetchAllData = async () => {
    if (!currentUser) return; // Only fetch if logged in
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const [p, pe, ol] = await Promise.all([
          fetchProductsSb(),
          fetchPeopleSb(),
          fetchOutputLogsSb()
        ]);
        setProducts(p);
        setPeople(pe);
        setOutputLogs(ol);
        setUsers([]); // gestão de usuários locais desativada
      } else {
        const [dbProducts, dbPeople, dbOutputLogs, dbUsers] = await Promise.all([
          getProductsDB(),
          getPeopleDB(),
          getOutputLogsDB(),
          getUsersDB()
        ]);
        setProducts(dbProducts);
        setPeople(dbPeople);
        setOutputLogs(dbOutputLogs);
        setUsers(dbUsers);
      }
      setDbError(null);
    } catch (error: any) {
      console.error("Error fetching data from DB:", error);
      setDbError(`Erro ao buscar dados: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Auth Handlers
  const handleLogin = async (usernameInput: string, passwordInput: string): Promise<boolean> => {
    try {
      if (isSupabaseConfigured) {
        await signInWithEmail(usernameInput, passwordInput);
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          setCurrentUser({ id: data.user.id, username: data.user.email || 'user' });
          await fetchAllData();
          setActiveView(View.Dashboard);
          return true;
        }
        alert('Falha no login.');
        return false;
      } else {
        const user = await getUserByUsernameDB(usernameInput);
        if (user && user.password === passwordInput) {
          setCurrentUser(user);
          sessionStorage.setItem('currentUser', JSON.stringify(user));
          await fetchAllData();
          setActiveView(View.Dashboard);
          return true;
        }
        alert("Nome de usuário ou senha inválidos.");
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Erro ao tentar fazer login.");
      return false;
    }
  };

  const handleRegister = async (usernameInput: string, passwordInput: string): Promise<boolean> => {
    // IMPORTANT: Add password strength validation in a real app
    try {
      if (isSupabaseConfigured) {
        await signUpWithEmail(usernameInput, passwordInput);
        alert('Cadastro realizado! Verifique seu e-mail se a confirmação estiver ativa e faça login.');
        return true;
      } else {
        const newUser: User = { id: Date.now().toString(), username: usernameInput, password: passwordInput };
        await addUserDB(newUser);
        alert("Usuário registrado com sucesso! Por favor, faça o login.");
        return true;
      }
    } catch (error: any) {
      if (error.name === 'ConstraintError') {
        alert("Nome de usuário já existe. Por favor, escolha outro.");
      } else {
        console.error("Registration error:", error);
        alert(`Erro ao registrar usuário: ${error.message}`);
      }
      return false;
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      try { await signOut(); } catch { }
    }
    setCurrentUser(null);
    sessionStorage.removeItem('currentUser');
  };

  // Product Handlers
  const handleProductSubmit = async (productData: Product) => {
    try {
      if (isSupabaseConfigured) {
        if (editingProduct) {
          await updateProductSb(productData);
        } else {
          const newProduct = { ...productData, id: productData.id || Date.now().toString() } as Product;
          await insertProductSb(newProduct);
        }
      } else {
        if (editingProduct) {
          await updateProductDB(productData);
        } else {
          const newProduct = { ...productData, id: productData.id || Date.now().toString() };
          await addProductDB(newProduct);
        }
      }
      await fetchAllData();
      setIsProductModalOpen(false);
      setEditingProduct(null);
    } catch (error: any) {
      console.error("Error submitting product:", error);
      if (error.name === 'ConstraintError') {
        alert(`Erro: SKU '${productData.sku}' já existe. O SKU deve ser único.`);
      } else {
        alert(`Erro ao salvar produto: ${error.message || 'Verifique o console para detalhes'}`);
      }
    }
  };

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleAddProduct = async (product: Product) => {
    try {
      if (isSupabaseConfigured) {
        await insertProductSb(product);
      } else {
        await addProductDB(product);
      }
      await fetchAllData();
      setIsProductModalOpen(false);
    } catch (error: any) {
      console.error("Failed to add product:", error);
      alert("Erro ao adicionar produto.");
    }
  };

  const handleBulkImport = async (products: Product[]) => {
    try {
      for (const product of products) {
        if (isSupabaseConfigured) {
          await upsertProductSb(product); // Use upsert to handle duplicates
        } else {
          await addProductDB(product);
        }
      }
      await fetchAllData();
    } catch (error: any) {
      console.error("Failed to bulk import:", error);
      throw new Error("Erro ao importar produtos em massa");
    }
  };


  const handleDeleteProduct = async (productId: string) => {
    try {
      if (isSupabaseConfigured) {
        await deleteProductSb(productId);
      } else {
        await deleteProductDB(productId);
      }
      await fetchAllData();
    } catch (error: any) {
      alert(`Erro ao excluir produto: ${error.message}`);
    }
  };


  // Person Handlers
  const handlePersonSubmit = async (personData: Person) => {
    try {
      if (isSupabaseConfigured) {
        if (editingPerson) {
          await updatePersonSb(personData);
        } else {
          const newPerson = { ...personData, id: personData.id || Date.now().toString() } as Person;
          await insertPersonSb(newPerson);
        }
      } else {
        if (editingPerson) {
          await updatePersonDB(personData);
        } else {
          const newPerson = { ...personData, id: personData.id || Date.now().toString() };
          await addPersonDB(newPerson);
        }
      }
      await fetchAllData();
      setIsPersonModalOpen(false);
      setEditingPerson(null);
    } catch (error: any) {
      alert(`Erro ao salvar pessoa: ${error.message}`);
    }
  };

  const openEditPersonModal = (person: Person) => {
    setEditingPerson(person);
    setIsPersonModalOpen(true);
  };

  const handleDeletePerson = async (personId: string) => {
    try {
      if (isSupabaseConfigured) {
        await deletePersonSb(personId);
      } else {
        await deletePersonDB(personId);
      }
      await fetchAllData();
    } catch (error: any) {
      alert(`Erro ao excluir pessoa: ${error.message}`);
    }
  };

  // User Handlers (Simplified: Add and Delete only)
  const handleUserSubmit = async (userData: Omit<User, 'id'>) => { // From UserForm
    try {
      // NOTE: In a real app, passwords should be hashed here before saving.
      // This form is only for adding new users. Editing is not implemented.
      const newUser = { ...userData, id: Date.now().toString() };
      await addUserDB(newUser);
      await fetchAllData(); // Refresh user list
      setIsUserModalOpen(false);
    } catch (error: any) {
      if (error.name === 'ConstraintError') {
        alert("Nome de usuário já existe.");
      } else {
        alert(`Erro ao adicionar usuário: ${error.message}`);
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (currentUser && currentUser.id === userId) {
      alert("Você não pode excluir sua própria conta.");
      return;
    }
    try {
      await deleteUserDB(userId);
      await fetchAllData(); // Refresh user list
    } catch (error: any) {
      alert(`Erro ao excluir usuário: ${error.message}`);
    }
  };

  const openDeleteConfirmation = (type: 'product' | 'person' | 'user', id: string) => {
    setItemToDelete({ type, id });
    setIsConfirmDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      if (itemToDelete.type === 'product') {
        const isProductInLog = outputLogs.some(log => log.productId === itemToDelete.id);
        if (isProductInLog) {
          alert("Este produto não pode ser excluído pois está registrado em um histórico de saídas.");
        } else {
          await handleDeleteProduct(itemToDelete.id);
        }
      } else if (itemToDelete.type === 'person') {
        const isPersonInLog = outputLogs.some(log => log.personId === itemToDelete.id);
        if (isPersonInLog) {
          alert("Esta pessoa não pode ser excluída pois está registrada em um histórico de saídas.");
        } else {
          await handleDeletePerson(itemToDelete.id);
        }
      } else if (itemToDelete.type === 'user') {
        await handleDeleteUser(itemToDelete.id);
      }
      setItemToDelete(null);
    }
    setIsConfirmDialogOpen(false);
  };

  // Output Handlers
  const handleOutputSubmit = useCallback(async (outputData: Omit<OutputLog, 'id' | 'timestamp' | 'productName' | 'personName'>): Promise<boolean> => {
    const product = products.find(p => p.id === outputData.productId);
    const person = people.find(p => p.id === outputData.personId);

    if (!product || !person) {
      alert("Produto ou pessoa selecionada não encontrados.");
      return false;
    }

    if (product.quantity < outputData.quantity) {
      alert(`Não há ${product.name} suficiente em estoque. Disponível: ${product.quantity}`);
      return false;
    }

    const updatedProduct: Product = { ...product, quantity: product.quantity - outputData.quantity };
    const newLogEntry: OutputLog = {
      ...outputData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      productName: product.name,
      personName: person.name,
    };

    try {
      if (isSupabaseConfigured) {
        await recordOutputSb(newLogEntry, updatedProduct.quantity);
      } else {
        await recordProductOutputDB(newLogEntry, updatedProduct);
      }
      await fetchAllData();
      setIsOutputModalOpen(false);
      return true;
    } catch (error: any) {
      alert(`Erro ao registrar saída: ${error.message}`);
      return false;
    }
  }, [products, people, fetchAllData]);


  if (isLoading && !currentUser && !sessionStorage.getItem('currentUser')) { // Show loading only if not already trying to show auth
    // Modified to prevent flicker when session is checked
  } else if (isLoading && currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-light">
        <p className="text-xl text-primary-DEFAULT">Carregando dados...</p>
      </div>
    );
  }


  if (dbError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-light p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md text-center" role="alert">
          <strong className="font-bold">Erro no Banco de Dados!</strong>
          <p className="block sm:inline mt-2">{dbError}</p>
          <p className="mt-2 text-sm">Por favor, tente recarregar a página. Se o problema persistir, verifique se o IndexedDB está habilitado e não bloqueado nas configurações do seu navegador.</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthView onLogin={handleLogin} onRegister={handleRegister} isSupabase={isSupabaseConfigured} />;
  }

  const renderView = () => {
    switch (activeView) {
      case View.Dashboard:
        return <DashboardView products={products} people={people} outputLogs={outputLogs} />;
      case View.Products:
        return (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-neutral-dark">Produtos</h2>
              <button
                onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
                className={BTN_PRIMARY_FLEX}
              >
                <PlusIcon className="w-5 h-5 mr-2" /> Adicionar Produto
              </button>
            </div>
            <ProductList products={products} onEdit={openEditProductModal} onDelete={(id) => openDeleteConfirmation('product', id)} />
          </>
        );
      case View.People:
        return (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-neutral-dark">Pessoas</h2>
              <button
                onClick={() => { setEditingPerson(null); setIsPersonModalOpen(true); }}
                className={BTN_PRIMARY_FLEX}
              >
                <PlusIcon className="w-5 h-5 mr-2" /> Adicionar Pessoa
              </button>
            </div>
            <PersonList people={people} onEdit={openEditPersonModal} onDelete={(id) => openDeleteConfirmation('person', id)} />
          </>
        );
      case View.Users: // New User Management View
        return (
          <UserManagementView
            users={users}
            onAddUser={() => setIsUserModalOpen(true)}
            onDeleteUser={(id) => openDeleteConfirmation('user', id)}
            currentUser={currentUser}
          />
        );
      case View.BulkImport:
        return <BulkImportView onImport={handleBulkImport} onClose={() => setActiveView(View.Products)} />;
      case View.RecordOutput:
        return (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-neutral-dark">Registrar Saída de Produto</h2>
              {!isOutputModalOpen && (
                <button
                  onClick={() => setIsOutputModalOpen(true)}
                  className={BTN_PRIMARY_FLEX}
                  disabled={!(products.length > 0 && people.length > 0)}
                >
                  <PlusIcon className="w-5 h-5 mr-2" /> Registrar Nova Saída
                </button>
              )}
            </div>
            {isOutputModalOpen && (
              <Modal isOpen={isOutputModalOpen} onClose={() => setIsOutputModalOpen(false)} title="Registrar Saída de Produto">
                <OutputForm products={products} people={people} onSubmit={handleOutputSubmit} onClose={() => setIsOutputModalOpen(false)} />
              </Modal>
            )}
            {!isOutputModalOpen && (
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                {products.length === 0 && <p className="text-amber-600 mb-2">Nenhum produto cadastrado. Adicione produtos antes de registrar uma saída.</p>}
                {people.length === 0 && <p className="text-amber-600 mb-2">Nenhuma pessoa cadastrada. Adicione pessoas antes de registrar uma saída.</p>}
                {(products.length > 0 && people.length > 0)
                  ? <p className="text-neutral-DEFAULT">Clique no botão acima para registrar uma nova saída de produto.</p>
                  : <p className="text-neutral-DEFAULT">Complete os cadastros necessários para habilitar o registro de saídas.</p>
                }
                <p className="text-sm text-neutral-DEFAULT mt-2">Certifique-se de que possui produtos com estoque disponível e pessoas cadastradas.</p>
              </div>
            )}
          </>
        );

      case View.OutputLog:
        return (
          <>
            <h2 className="text-2xl font-semibold text-neutral-dark mb-6">Histórico de Saídas</h2>
            <OutputLogList outputLogs={outputLogs} />
          </>
        );
      default:
        setActiveView(View.Dashboard);
        return <DashboardView products={products} people={people} outputLogs={outputLogs} />;
    }
  };

  const getConfirmationMessage = () => {
    if (!itemToDelete) return "";
    let itemTypeMsg = "";
    switch (itemToDelete.type) {
      case 'product': itemTypeMsg = 'produto'; break;
      case 'person': itemTypeMsg = 'pessoa'; break;
      case 'user': itemTypeMsg = 'usuário'; break;
    }
    let message = `Tem certeza que deseja excluir este ${itemTypeMsg}? Esta ação não pode ser desfeita.`;

    if (itemToDelete.type === 'product' && outputLogs.some(log => log.productId === itemToDelete.id)) {
      message = `AVISO: Este produto está referenciado em registros de saída e NÃO PODE ser excluído.`;
    }
    if (itemToDelete.type === 'person' && outputLogs.some(log => log.personId === itemToDelete.id)) {
      message = `AVISO: Esta pessoa está referenciada em registros de saída e NÃO PODE ser excluída.`;
    }
    if (itemToDelete.type === 'user' && currentUser && itemToDelete.id === currentUser.id) {
      message = `AVISO: Você não pode excluir sua própria conta. Esta ação será bloqueada.`;
    }
    return message;
  };


  return (
    <div className={`min-h-screen ${isDark ? 'bg-neutral-dark' : 'bg-neutral-light'}`}>
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        currentUser={currentUser}
        onLogout={handleLogout}
        canManageUsers={true}
        onToggleTheme={() => setIsDark(prev => !prev)}
        isDark={isDark}
      />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderView()}
      </main>

      <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} title={editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}>
        <ProductForm
          onSubmit={handleProductSubmit}
          onClose={() => setIsProductModalOpen(false)}
          initialData={editingProduct}
        />
      </Modal>

      <Modal isOpen={isPersonModalOpen} onClose={() => setIsPersonModalOpen(false)} title={editingPerson ? 'Editar Pessoa' : 'Adicionar Nova Pessoa'}>
        <PersonForm
          onSubmit={handlePersonSubmit}
          onClose={() => setIsPersonModalOpen(false)}
          initialData={editingPerson}
        />
      </Modal>

      {/* Placeholder for UserForm Modal - to be created next */}
      <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title="Adicionar Novo Usuário">
        <UserForm onSubmit={handleUserSubmit} onClose={() => setIsUserModalOpen(false)} />
      </Modal>

      <ConfirmationDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message={getConfirmationMessage()}
      />
    </div>
  );
};

// Simple UserForm (can be expanded later)
interface UserFormProps {
  onSubmit: (user: Omit<User, 'id'>) => void;
  onClose: () => void;
}
const UserForm: React.FC<UserFormProps> = ({ onSubmit, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Nome de usuário e senha são obrigatórios.');
      return;
    }
    // Add password confirmation and strength validation in a real app
    onSubmit({ username, password });
  };

  const formFieldClasses = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT sm:text-sm";
  const labelClasses = "block text-sm font-medium text-neutral-DEFAULT";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm bg-red-100 p-2 rounded-md">{error}</p>}
      <div>
        <label htmlFor="userName" className={labelClasses}>Nome de Usuário <span className="text-red-500">*</span></label>
        <input type="text" id="userName" value={username} onChange={(e) => setUsername(e.target.value)} className={formFieldClasses} required />
      </div>
      <div>
        <label htmlFor="password" className={labelClasses}>Senha <span className="text-red-500">*</span></label>
        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className={formFieldClasses} required />
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-neutral-dark bg-neutral-light rounded-md hover:bg-gray-200 transition-colors">
          Cancelar
        </button>
        <button type="submit" className="px-4 py-2 text-sm font-medium bg-primary-DEFAULT text-white rounded-md hover:bg-primary-dark transition-colors shadow ring-1 ring-primary-light">
          Adicionar Usuário
        </button>
      </div>
    </form>
  );
};


export default App;
