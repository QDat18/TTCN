import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const PaymentReturn = () => {
    const [searchParams] = useSearchParams();
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const orderId = searchParams.get('orderId');

    useEffect(() => {
        const status = searchParams.get('status');
        if (status === 'success') {
            setMessage('Thanh toán thành công!');
            setIsSuccess(true);
        } else {
            setMessage('Thanh toán thất bại. Vui lòng thử lại hoặc liên hệ hỗ trợ.');
            setIsSuccess(false);
        }
    }, [searchParams]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-10 rounded-lg shadow-lg text-center max-w-md">
                {isSuccess ? (
                    <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ) : (
                    <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )}
                <h1 className={`mt-4 text-2xl font-bold ${isSuccess ? 'text-gray-800' : 'text-red-600'}`}>
                    {message}
                </h1>
                <p className="mt-2 text-gray-600">Cảm ơn bạn đã mua hàng.</p>
                {orderId && (
                     <div className="mt-6">
                        <Link 
                            to={`/my-orders/${orderId}`} 
                            className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
                        >
                            Xem chi tiết đơn hàng
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentReturn;